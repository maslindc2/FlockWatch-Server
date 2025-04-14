import { model, Schema } from "mongoose";
import { IFlockCasesByState } from "../interfaces/i-flock-cases-by-state";
import { logger } from "../utils/winston-logger";
import { FlockCasesByStateService } from "./model-services/flock-cases-by-state-service";
import { LastReportDateService } from "./model-services/last-report-date-service";
import { USSummaryService } from "./model-services/us-summary-service";
import { RequestDataService } from "./request-data-service";

class FlockDataSyncService {
    private lastReportDateService: LastReportDateService;
    constructor() {
        this.lastReportDateService = new LastReportDateService();
    }
    public async syncIfOutdated(): Promise<void> {
        const lastReportDateQuery =
            await this.lastReportDateService.getLastScrapedDate();
        const lastScrapedDate =
            lastReportDateQuery?.lastScrapedDate as unknown as string;

        if (!lastScrapedDate || this.isOutdated(lastScrapedDate)) {
            logger.info(
                "Database information is out of date, requesting new info!"
            );
            await this.requestData();
        } else {
            logger.silly("Database is up to date no need for changes!");
        }
    }

    private isOutdated(lastDate: string): boolean {
        const now = new Date();
        const last = new Date(lastDate);
        const diffInMs = now.getTime() - last.getTime();
        return diffInMs >= 24 * 60 * 60 * 1000; // 24 hours
    }

    private async requestData() {
        // Create our scraper data service and last report date service to get our authID
        const scraperDataService = new RequestDataService();

        // Get the authID from our model
        const modelInfo = await this.lastReportDateService.getAuthID();
        // Fetch the latest avian influenza state data
        const data = await scraperDataService.fetchLatestFlockData(
            modelInfo?.authID!
        );

        // If the data was null throw an error
        if (!data) {
            throw new Error("Scraper Data is empty");
        } else {
            // Since we have finished generate a new auth id
            await this.lastReportDateService.createOrUpdateLastReportDate();

            // Create an instance of our flock cases by state service
            const flockCasesByStateService = new FlockCasesByStateService();
            // extract the state data array and store it, should be an array of type IFlockCasesByState
            const flockCasesByState: IFlockCasesByState[] =
                data?.flockCasesByState;
            // Create or update the state data in the database
            await flockCasesByStateService.createOrUpdateStateData(
                flockCasesByState
            );
            // Create an instance of our us summary stats service
            const usSummaryStats = new USSummaryService();
            // Create or update the USSummaryStats using the data we got back from the scraping service
            await usSummaryStats.createOrUpdateUSummaryStats(
                data?.usSummaryStats
            );
        }
    }
}
export { FlockDataSyncService };
