import { logger } from "../../utils/winston-logger";
import { LastReportDateService } from "../last-report-date/last-report-date.service";
import { FlockDataUpdateService } from "./flock-data-update.service";
import { RequestDataService } from "./request-data.service";

class FlockDataSyncService {
    // Stores our Last Report Date Service instance
    private lastReportDateService: LastReportDateService;
    private requestDataService: RequestDataService;
    private updateService: FlockDataUpdateService;

    // Create our last report date service
    constructor() {
        this.lastReportDateService = new LastReportDateService();
        this.requestDataService = new RequestDataService();
        this.updateService = new FlockDataUpdateService();
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
            await this.requestAndApplyData();
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

    // Request new data from Flock Watch Scraping
    private async requestAndApplyData() {
        const modelInfo = await this.lastReportDateService.getAuthID();

        const data = await this.requestDataService.fetchLatestFlockData(
            modelInfo?.auth_id!
        );
        if (!data) {
            logger.error("Data is empty!");
            await this.lastReportDateService.updateLastReportDate(false);
            return;
        }
        await this.updateService.applyUpdate(data);
    }
}
export { FlockDataSyncService };
