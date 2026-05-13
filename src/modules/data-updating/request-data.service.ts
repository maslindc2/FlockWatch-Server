import { logger } from "../../utils/winston-logger";
import { FetchRetryAuthID } from "../fetch-retry/fetch-retry-authID";
import { FlockCasesByState } from "../flock-cases-by-state/flock-cases-by-state.interface";
import {
    AllTimeTotals,
    PeriodSummary,
    USSummaryStats,
} from "../us-summary/us-summary-stats.interface";
import { FlockData } from "./flock-data.interface";
import { BuildUSSummary } from "./build-us-summary.service";
import { SiteDetails } from "../site-details/site-details.interface";

interface ScraperData {
    flock_cases_by_state: FlockCasesByState[];
    period_summaries: PeriodSummary[];
    site_details: SiteDetails[];
    historical_summary: Omit<HistoricalSummary, "key">;
    status_summary: Omit<StatusSummary, "key">;
}

import { HistoricalSummary } from "../historical-summary/historical-summary.interface";
import { StatusSummary } from "../status-summary/status-summary.interface";

class RequestDataService {
    private buildUSSummaryObj: BuildUSSummary;

    constructor() {
        this.buildUSSummaryObj = new BuildUSSummary();
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
            "http://localhost:8080/scraper/get-data";

        try {
            const fetchRetry = new FetchRetryAuthID(authID);
            const res = await fetchRetry.getRetry(
                fwScrapingURL,
                3,
                2 * 60 * 1000,
                500
            );

            if (!res!.ok) {
                logger.error(`Scraping service returned HTTP ${res!.status}`);
                return null;
            }

            const jsonResponse = await res!.json();

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
    ): Promise<FlockData | null> {
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
        const usSummaryStats: USSummaryStats =
            this.buildUSSummaryObj.createUSSummaryData(
                flockCasesByState,
                periodSummaries
            );

        // Assemble all of the fields we received from the scraper into a FlockData object that we can use to update our database
        const latestFlockData: FlockData = {
            us_summary_stats: usSummaryStats,
            flock_cases_by_state: flockCasesByState,
            site_details: jsonFromScraper.site_details || [],
            historical_summary: jsonFromScraper.historical_summary || {
                total_birds_affected_all_time: 0,
                total_sites_all_time: 0,
                total_active_sites: 0,
                total_released_sites: 0,
                total_na_sites: 0,
                total_birds_active: 0,
            },
            status_summary: jsonFromScraper.status_summary || {
                sites_confirmed_last_30_days: 0,
                sites_released_last_30_days: 0,
                birds_affected_last_30_days: 0,
            },
        };
        // Return the flock data
        return latestFlockData;
    }
}
export { RequestDataService };
