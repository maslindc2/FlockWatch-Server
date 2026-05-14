import { FlockCasesByState } from "../flock-cases-by-state/flock-cases-by-state.interface";
import { USSummaryStats } from "../us-summary/us-summary-stats.interface";
import { SiteDetails } from "../site-details/site-details.interface";
import { HistoricalSummary } from "../historical-summary/historical-summary.interface";
import { StatusSummary } from "../status-summary/status-summary.interface";

// This is the data type for object that we get from our scraping service and use to update our database with the latest avian influenza information
interface FlockData {
    flock_cases_by_state: FlockCasesByState[];
    us_summary_stats: USSummaryStats;
    site_details: SiteDetails[];
    historical_summary: Omit<HistoricalSummary, "key">;
    status_summary: Omit<StatusSummary, "key">;
}

export type { FlockData };
