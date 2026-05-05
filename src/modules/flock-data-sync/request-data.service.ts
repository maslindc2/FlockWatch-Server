import { logger } from "../../utils/winston-logger";
import { FlockCasesByState } from "../flock-cases-by-state/flock-cases-by-state.interface";
import {
    AllTimeTotals,
    PeriodSummary,
    USSummaryStats,
} from "../us-summary/us-summary-stats.interface";
import { LatestFlockData } from "./latest-flock-data.interface";

interface ScraperData {
    flock_cases_by_state: FlockCasesByState[];
    period_summaries: PeriodSummary[];
}

class RequestDataService {
    /**
     * Assemble the US Summary Stats by summing the total birds affected, flocks affected, backyard flocks, and commercial flocks
     * @param jsonFromScraper Array containing all US State's Avian Influenza data
     * @returns JS Object containing the US Summary Stats of type USSummaryStats
     */
    private createUSSummaryData(
        jsonFromScraper: FlockCasesByState[],
        period_summaries: PeriodSummary[]
    ): USSummaryStats {
        const all_time_totals: AllTimeTotals = {
            total_states_affected: 0,
            total_birds_affected: 0,
            total_flocks_affected: 0,
            total_backyard_flocks_affected: 0,
            total_commercial_flocks_affected: 0,
        };

        // For each state object populate the usSummaryStats by iterating through each states individual data
        jsonFromScraper.forEach((stateObj) => {
            // Since Scraper only sends data for states that have outbreaks...
            // we can safely increment the totalStatesAffected by 1 for each state object
            all_time_totals.total_states_affected += 1;
            all_time_totals.total_birds_affected += stateObj.birds_affected;
            all_time_totals.total_flocks_affected += stateObj.total_flocks;
            all_time_totals.total_backyard_flocks_affected +=
                stateObj.backyard_flocks;
            all_time_totals.total_commercial_flocks_affected +=
                stateObj.commercial_flocks;
        });

        return {
            key: "us-summary",
            all_time_totals,
            period_summaries,
        };
    }

    /**
     * This will be used for requesting the newest data from our scraping service
     * @param authID This is the authentication ID (random UUID) from our last report date model
     * @returns Promise containing an Array with all US state data for avian influenza
     */
    private async requestDataFromScrapingService(
        authID: string
    ): Promise<ScraperData | null> {
        // Store the scraping service URL
        const fwScrapingURL =
            process.env.SCRAPING_SERVICE_URL ||
            "http://localhost:8080/scraper/process-data";

        const wait = (ms: number) =>
            new Promise((resolve) => setTimeout(resolve, ms));

        // This function handles sending our post request with a timeout, if the timeout expires we retry again
        const fetchWithTimeout = async (
            url: string,
            options: RequestInit,
            timeoutMs: number
        ): Promise<Response> => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), timeoutMs);
            try {
                return await fetch(url, {
                    ...options,
                    signal: controller.signal,
                });
            } finally {
                clearTimeout(timeout);
            }
        };

        // This handles how often we retry our requests, the number of attempts, and creates delay between the attempts to account for network latency
        const fetchWithRetry = async (
            url: string,
            retries: number,
            timeoutMs: number,
            baseDelay: number,
            authID: string
        ): Promise<Response> => {
            try {
                return await fetchWithTimeout(
                    url,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${authID}`,
                        },
                    },
                    timeoutMs
                );
            } catch (error: any) {
                // Only retry network errors (fetch throws on network issues or abort)
                if (retries <= 0) throw error;

                logger.http(
                    `Network error contacting scraper, retries left ${retries}: ${error.message}`
                );

                const attemptNumber = retries;
                const rawDelay = baseDelay * Math.pow(2, attemptNumber);
                const jitter = Math.floor(Math.random() * baseDelay);
                await wait(rawDelay + jitter);

                return fetchWithRetry(
                    url,
                    retries - 1,
                    timeoutMs,
                    baseDelay,
                    authID
                );
            }
        };

        try {
            const res = await fetchWithRetry(
                fwScrapingURL,
                3,
                120000,
                500,
                authID
            );

            if (!res.ok) {
                logger.error(`Scraping service returned HTTP ${res.status}`);
                return null;
            }

            const jsonResponse = await res.json();

            if (!jsonResponse || Object.keys(jsonResponse).length === 0) {
                logger.error(
                    `Received empty or invalid JSON from scraping service`
                );
                return null;
            }

            return jsonResponse;
        } catch (error) {
            logger.error(`Failed to fetch from scraper: ${error}`);
            return null;
        }
    }

    /**
     * Calls the above function for requesting data from our Scrapers with the authID we fetched from our last report model
     * @param authID This is the UUID from our Last Report Date Model
     * @returns an Array containing our Flock Data and the US Summary Stats as well.
     */
    public async fetchLatestFlockData(
        authID: string
    ): Promise<LatestFlockData | null> {
        // Request the data from the above function using the authID and store it as an array
        const jsonFromScraper: ScraperData | null =
            await this.requestDataFromScrapingService(authID);

        // If we didn't get any data log the error
        if (!jsonFromScraper) {
            throw new Error("Failed to receive data from scraping service!");
        }

        const flockCasesByState: FlockCasesByState[] =
            jsonFromScraper.flock_cases_by_state;

        const periodSummaries: PeriodSummary[] =
            jsonFromScraper.period_summaries;

        // Create the US Summary Data from the array of state data that we received earlier
        const usSummaryStats: USSummaryStats = this.createUSSummaryData(
            flockCasesByState,
            periodSummaries
        );

        // Assemble it as a JS object
        const latestFlockData: LatestFlockData = {
            us_summary_stats: usSummaryStats,
            flock_cases_by_state: flockCasesByState,
        };
        // Return the flock data
        return latestFlockData;
    }
}
export { RequestDataService };
