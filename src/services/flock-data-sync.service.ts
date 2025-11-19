import { logger } from "../utils/winston-logger";
import { FlockCasesByStateService } from "../modules/flock-cases-by-state/flock-cases-by-state.service";
import { USSummaryService } from "../modules/us-summary/us-summary.service";
import { RequestDataService } from "../modules/scraping/request-data.service";
import { LastReportDateService } from "../modules/last-report-date/last-report-date.service";


class FlockDataSyncService {
    // Stores our Last Report Date Service instance
    private lastReportDateService: LastReportDateService;

    // Create our last report date service
    constructor() {
        this.lastReportDateService = new LastReportDateService();
    }

    // Sync if we are out of date, we will check the last scraped date and see if we are out of date or not
    // If we are we will request new data and process it accordingly, if not just log that we are up to date (only visible on log level silly)
    public async syncIfOutdated(): Promise<void> {
        const lastReportDateQuery =
            await this.lastReportDateService.getLastScrapedDate();
        const lastScrapedDate =
            lastReportDateQuery?.last_scraped_date as unknown as string;

        if (!lastScrapedDate || this.isOutdated(lastScrapedDate)) {
            logger.info(
                "Database information is out of date, requesting new info!"
            );
            await this.requestData();
        } else {
            logger.silly("Database is up to date no need for changes!");
        }
    }

    // Compare the last report date to our current time if it's a difference of 24 hours then update
    private isOutdated(lastDate: string): boolean {
        const now = new Date();
        const last = new Date(lastDate);
        const diffInMs = now.getTime() - last.getTime();
        return diffInMs >= 24 * 60 * 60 * 1000; // 24 hours
    }
    // Request new data from Flock Watch Server
    private async requestData() {
        // Create our scraper data service and last report date service to get our authID
        const scraperDataService = new RequestDataService();

        let isSuccessfulUpdate = false;

        // Get the authID from our model
        const modelInfo = await this.lastReportDateService.getAuthID();
        
        // Fetch the latest avian influenza state data
        const data = await scraperDataService.fetchLatestFlockData(
            modelInfo?.auth_id!
        );

        // If the data was null throw an error
        if (!data) {
            isSuccessfulUpdate = false;
            logger.error("Scraper Data is empty");
        } else {
            isSuccessfulUpdate = true;
            // Create an instance of our flock cases by state service
            const flockCasesByStateService = new FlockCasesByStateService();
            // Create an instance of our us summary stats service
            const usSummaryStats = new USSummaryService();

            // Create or update the state data in the database
            await flockCasesByStateService
                .createOrUpdateStateData(data?.flock_cases_by_state)
                .then(() => {
                    logger.info(
                        "Finished updating state data in the database!"
                    );
                })
                .catch(() => {
                    isSuccessfulUpdate = false;
                });

            // Create or update the USSummaryStats using the data we got back from the scraping service
            await usSummaryStats
                .upsertUSSummary(data?.us_summary_stats)
                .then(() => {
                    logger.info("Finished updating US Summary Stats!");
                })
                .catch(() => {
                    isSuccessfulUpdate = false;
                });
        }
        // If we have finished or failed to get new data, generate a new Auth ID
        await this.lastReportDateService.updateLastReportDate(
            isSuccessfulUpdate
        );
    }
}
export { FlockDataSyncService };
