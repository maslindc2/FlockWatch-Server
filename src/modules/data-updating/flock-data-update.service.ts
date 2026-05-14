import { logger } from "../../utils/winston-logger";
import { FlockCasesByStateService } from "../flock-cases-by-state/flock-cases-by-state.service";
import { USSummaryService } from "../us-summary/us-summary.service";
import { LastReportDateService } from "../last-report-date/last-report-date.service";
import { SiteDetailsService } from "../site-details/site-details.service";
import { HistoricalSummaryService } from "../historical-summary/historical-summary.service";
import { StatusSummaryService } from "../status-summary/status-summary.service";
import { FlockCasesByState } from "../flock-cases-by-state/flock-cases-by-state.interface";
import { PeriodSummary } from "../us-summary/us-summary-stats.interface";
import { FlockData } from "./flock-data.interface";

interface FlockDataPayload {
    flock_cases_by_state: FlockCasesByState[];
    period_summaries: PeriodSummary[];
}

class FlockDataUpdateService {
    private flockCasesByStateService: FlockCasesByStateService;
    private usSummaryService: USSummaryService;
    private lastReportDateService: LastReportDateService;
    private siteDetailsService: SiteDetailsService;
    private historicalSummaryService: HistoricalSummaryService;
    private statusSummaryService: StatusSummaryService;

    constructor() {
        this.flockCasesByStateService = new FlockCasesByStateService();
        this.usSummaryService = new USSummaryService();
        this.lastReportDateService = new LastReportDateService();
        this.siteDetailsService = new SiteDetailsService();
        this.historicalSummaryService = new HistoricalSummaryService();
        this.statusSummaryService = new StatusSummaryService();
    }

    public async applyUpdate(data: FlockData): Promise<boolean> {
        const results = await Promise.all([
            this.flockCasesByStateService
                .createOrUpdateStateData(data.flock_cases_by_state)
                .then(() => {
                    logger.info(
                        "Finished updating state data in the database!"
                    );
                    return true;
                })
                .catch((error) => {
                    logger.error("Failed updating flock cases by state", error);
                    return false;
                }),
            this.usSummaryService
                .upsertUSSummary(data.us_summary_stats)
                .then(() => {
                    logger.info("Finished updating US Summary Stats!");
                    return true;
                })
                .catch((error) => {
                    logger.error("Failed updating US Summary Stats", error);
                    return false;
                }),
            this.siteDetailsService
                .upsertSiteDetails(data.site_details)
                .then(() => {
                    logger.info(
                        "Finished updating site details in the database!"
                    );
                    return true;
                })
                .catch((error) => {
                    logger.error("Failed updating site details", error);
                    return false;
                }),
            this.historicalSummaryService
                .upsertHistoricalSummary(data.historical_summary)
                .then(() => {
                    logger.info(
                        "Finished updating historical summary in the database!"
                    );
                    return true;
                })
                .catch((error) => {
                    logger.error("Failed updating historical summary", error);
                    return false;
                }),
            this.statusSummaryService
                .upsertStatusSummary(data.status_summary)
                .then(() => {
                    logger.info(
                        "Finished updating status summary in the database!"
                    );
                    return true;
                })
                .catch((error) => {
                    logger.error("Failed updating status summary", error);
                    return false;
                }),
        ]);

        const isSuccessfulUpdate = results.every(Boolean);

        await this.lastReportDateService.updateLastReportDate(
            isSuccessfulUpdate
        );
        return isSuccessfulUpdate;
    }
}

export { FlockDataUpdateService };
export type { FlockDataPayload };
