import { logger } from "../utils/winston-logger";
import { IFlockCasesByState } from "../interfaces/i-flock-cases-by-state";
import { IUSSummaryStats } from "../interfaces/i-us-summary-stats";
import { ILatestFlockData } from "../interfaces/i-latest-flock-data";

class RequestDataService {
    private createUSSummaryData(
        jsonFromScraper: IFlockCasesByState[]
    ): IUSSummaryStats {
        const usSummaryStats = {
            totalStatesAffected: 0,
            totalBirdsAffectedNationwide: 0,
            totalFlocksAffectedNationwide: 0,
            totalBackyardFlocksNationwide: 0,
            totalCommercialFlocksNationwide: 0,
        };

        // For each state object populate the usSummaryStats by iterating through each states individual data
        jsonFromScraper.forEach((stateObj) => {
            // Since Scraper only sends data for states that have outbreaks...
            // we can safely increment the totalStatesAffected by 1 for each state object
            usSummaryStats.totalStatesAffected += 1;
            usSummaryStats.totalBirdsAffectedNationwide +=
                stateObj.birdsAffected;
            usSummaryStats.totalFlocksAffectedNationwide +=
                stateObj.totalFlocks;
            usSummaryStats.totalBackyardFlocksNationwide +=
                stateObj.backyardFlocks;
            usSummaryStats.totalCommercialFlocksNationwide +=
                stateObj.commercialFlocks;
        });

        return usSummaryStats;
    }
    private async requestDataFromScrapingService(
        authID: string
    ): Promise<IFlockCasesByState[] | null> {
        const fwScrapingURL =
            process.env.SCRAPING_SERVICE_URL ||
            "http://localhost:8080/scraper/process-data";
        try {
            const res = await fetch(fwScrapingURL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    authID: authID,
                }),
            });
            if (!res.ok) {
                logger.error(
                    `Failed to update data, received status ${res.status}`
                );
                return null;
            }
            const jsonResponse = await res.json();
            if (!Array.isArray(jsonResponse) || jsonResponse.length === 0) {
                logger.error(
                    `Received empty or invalid JSON Array from Scraping Service`
                );
                return null;
            }
            return jsonResponse;
        } catch (error) {
            logger.error(`Failed to make request to scraper ${error}`);
            return null;
        }
    }

    public async fetchLatestFlockData(
        authID: string
    ): Promise<ILatestFlockData | null> {
        const jsonFromScraper: IFlockCasesByState[] | null =
            await this.requestDataFromScrapingService(authID);
        if (!jsonFromScraper) {
            throw new Error("Failed to receive data from scraping service!");
        }

        const usSummaryStats = this.createUSSummaryData(jsonFromScraper);

        const latestFlockData: ILatestFlockData = {
            usSummaryStats: usSummaryStats,
            flockCasesByState: jsonFromScraper,
        };

        return latestFlockData;
    }
}
export { RequestDataService };
