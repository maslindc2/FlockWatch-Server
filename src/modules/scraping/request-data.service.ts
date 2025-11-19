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
        // Define the URL that we will use from our ENV variable or the default localhost url
        const fwScrapingURL =
            process.env.SCRAPING_SERVICE_URL ||
            "http://localhost:8080/scraper/process-data";

        // Try and request data from the scraping service
        try {
            // Make the POST request using the fetch function to our Flock Watch Scraping
            const res = await fetch(fwScrapingURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${authID}`,
                },
            });
            // If it fails then log the error which will be picked up by our transport and return null
            if (!res.ok) {
                logger.error(
                    `Failed to update data, received status ${res.status}`
                );
                return null;
            }
            // Parse to JSON and store it to a JS variable
            const jsonResponse = await res.json();
            // If it's not an array or if the response is of length 0 report the error
            if (jsonResponse.length === 0) {
                logger.error(
                    `Received empty or invalid JSON Array from Scraping Service`
                );
                return null;
            }
            // Return the data that has been parsed
            return jsonResponse;
        } catch (error) {
            logger.error(`Failed to make request to scraper ${error}`);
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
