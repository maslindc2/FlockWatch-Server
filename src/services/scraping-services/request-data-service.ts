import { logger } from "../../utils/winston-logger";
import { IFlockCasesByState } from "../../interfaces/i-flock-cases-by-state";
import { IAllTimeTotals, IPeriodSummary, IUSSummaryStats } from "../../interfaces/i-us-summary-stats";
import { ILatestFlockData } from "../../interfaces/i-latest-flock-data";

interface IScraperData {
    flockCasesByState: IFlockCasesByState[]
    periodSummaries: IPeriodSummary[]
}

class RequestDataService {
    /**
     * Assemble the US Summary Stats by summing the total birds affected, flocks affected, backyard flocks, and commercial flocks
     * @param jsonFromScraper Array containing all US State's Avian Influenza data
     * @returns JS Object containing the US Summary Stats of type IUSSummaryStats
     */
    private createUSSummaryData(
        jsonFromScraper: IFlockCasesByState[],
        periodSummaries: IPeriodSummary[]
    ): IUSSummaryStats {
        const allTimeTotals: IAllTimeTotals = {
            totalStatesAffected: 0,
            totalBirdsAffected: 0,
            totalFlocksAffected: 0,
            totalBackyardFlocksAffected: 0,
            totalCommercialFlocksAffected: 0,
        };

        // For each state object populate the usSummaryStats by iterating through each states individual data
        jsonFromScraper.forEach((stateObj) => {
            // Since Scraper only sends data for states that have outbreaks...
            // we can safely increment the totalStatesAffected by 1 for each state object
            allTimeTotals.totalStatesAffected += 1;
            allTimeTotals.totalBirdsAffected +=
                stateObj.birdsAffected;
            allTimeTotals.totalFlocksAffected +=
                stateObj.totalFlocks;
            allTimeTotals.totalBackyardFlocksAffected +=
                stateObj.backyardFlocks;
            allTimeTotals.totalCommercialFlocksAffected +=
                stateObj.commercialFlocks;
        });

        return {
            key: "us-summary",
            allTimeTotals,
            periodSummaries
        };
    }

    /**
     * This will be used for requesting the newest data from our scraping service
     * @param authID This is the authentication ID (random UUID) from our last report date model
     * @returns Promise containing an Array with all US state data for avian influenza
     */
    private async requestDataFromScrapingService(
        authID: string
    ): Promise<IScraperData | null> {
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
    ): Promise<ILatestFlockData | null> {
        // Request the data from the above function using the authID and store it as an array
        const jsonFromScraper: IScraperData | null =
            await this.requestDataFromScrapingService(authID);

        // If we didn't get any data log the error
        if (!jsonFromScraper) {
            throw new Error("Failed to receive data from scraping service!");
        }

        const flockCasesByState:IFlockCasesByState[] = jsonFromScraper.flockCasesByState;

        const periodSummaries:IPeriodSummary[] = jsonFromScraper.periodSummaries;

        // Create the US Summary Data from the array of state data that we received earlier
        const usSummaryStats:IUSSummaryStats = this.createUSSummaryData(flockCasesByState, periodSummaries);
        
        // Assemble it as a JS object
        const latestFlockData: ILatestFlockData = {
            usSummaryStats: usSummaryStats,
            flockCasesByState: flockCasesByState,
        };
        // Return the flock data
        return latestFlockData;
    }
}
export { RequestDataService };
