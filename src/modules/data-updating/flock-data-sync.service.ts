import { logger } from "../../utils/winston-logger";
import { LastReportDateService } from "../last-report-date/last-report-date.service";
import { FlockDataUpdateService } from "./flock-data-update.service";
import { RequestDataService } from "./request-data.service";

/**
 * Coordinates checking whether the database is outdated and, if so,
 * fetches fresh data from the scraping service and applies updates.
 */
class FlockDataSyncService {
    private lastReportDateService: LastReportDateService;
    private requestDataService: RequestDataService;
    private updateService: FlockDataUpdateService;

    constructor() {
        this.lastReportDateService = new LastReportDateService();
        this.requestDataService = new RequestDataService();
        this.updateService = new FlockDataUpdateService();
    }

    /**
     * Check the last scraped date and, if more than 24 hours old, request
     * and apply fresh data from the scraping service.
     */
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

    /**
     * Determine whether the given date string is older than 24 hours from now.
     * @param lastDate ISO date string of the last scrape.
     * @returns true if more than 24 hours have elapsed.
     */
    private isOutdated(lastDate: string): boolean {
        const now = new Date();
        const last = new Date(lastDate);
        const diffInMs = now.getTime() - last.getTime();
        return diffInMs >= 24 * 60 * 60 * 1000; // 24 hours
    }

    /**
     * Fetch the latest flock data from the scraping service using the stored auth ID
     * and apply the update to the database.
     */
    private async requestAndApplyData() {
        const modelInfo = await this.lastReportDateService.getAuthID();
        if (!modelInfo || !modelInfo.auth_id) {
            logger.error("No auth ID found for requesting data!");
            return;
        }

        
        const data = await this.requestDataService.fetchLatestFlockData(
            modelInfo?.auth_id as string
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
