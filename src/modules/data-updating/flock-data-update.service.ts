import {logger} from "../../utils/winston-logger";
import { FlockCasesByStateService } from "../flock-cases-by-state/flock-cases-by-state.service";
import { USSummaryService } from "../us-summary/us-summary.service";
import { LastReportDateService } from "../last-report-date/last-report-date.service";
import { FlockCasesByState } from "../flock-cases-by-state/flock-cases-by-state.interface";
import { PeriodSummary } from "../us-summary/us-summary-stats.interface";
import { BuildUSSummary } from "./build-us-summary.service";
import { FlockData } from "./flock-data.interface";

interface FlockDataPayload {
    flock_cases_by_state: FlockCasesByState[]
    period_summaries: PeriodSummary[]
}

class FlockDataUpdateService {
    private flockCasesByStateService: FlockCasesByStateService;
    private usSummaryService: USSummaryService;
    private lastReportDateService: LastReportDateService;

    constructor() {
        this.flockCasesByStateService = new FlockCasesByStateService();
        this.usSummaryService = new USSummaryService();
        this.lastReportDateService = new LastReportDateService();
    }

    public async applyUpdate(data: FlockData): Promise<boolean> {
        // this variable is responsible for updating the Last Report Date and Auth ID
        let isSuccessfulUpdate = true;
        try {
            await this.flockCasesByStateService.createOrUpdateStateData(
                data.flock_cases_by_state
            );
            logger.info("Finished updating state data in the database!");
        } catch (error) {
            logger.error("Failed updating flock cases by state", error);
            // We failed to update our flock cases by state model, so only update our Auth ID
            isSuccessfulUpdate = false;
        }
        
        try {
            await this.usSummaryService.upsertUSSummary(
                data.us_summary_stats
            );
            logger.info("Finished updating US Summary Stats!");
        } catch (error) {
            logger.error("Failed updating US Summary Stats", error);
            // We failed to update our flock cases by state model, so only update our Auth ID
            isSuccessfulUpdate = false;
        }
        // Update last report date model, either only rotating the auth ID or update both authID and the date
        await this.lastReportDateService.updateLastReportDate(isSuccessfulUpdate);
        return isSuccessfulUpdate;
    }
}

export { FlockDataUpdateService, FlockDataPayload };