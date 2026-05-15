import { FlockCasesByState } from "../flock-cases-by-state/flock-cases-by-state.interface";
import { USSummaryStats } from "../us-summary/us-summary-stats.interface";
import { SiteDetails } from "../site-details/site-details.interface";
import { HistoricalSummary } from "../historical-summary/historical-summary.interface";
import { StatusSummary } from "../status-summary/status-summary.interface";

/**
 * The top-level data payload received from the scraping service.
 * Contains all avian influenza information used to update the database.
 */
interface FlockData {
    flock_cases_by_state: FlockCasesByState[];
    us_summary_stats: USSummaryStats;
    site_details: SiteDetails[];
    historical_summary: Omit<HistoricalSummary, "key">;
    status_summary: Omit<StatusSummary, "key">;
}

export type { FlockData };
