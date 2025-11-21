import { FlockCasesByState } from "../flock-cases-by-state/flock-cases-by-state.interface";
import { USSummaryStats } from "../us-summary/us-summary-stats.interface";

// This is the data type for object that we get from our scraping service
interface LatestFlockData {
    us_summary_stats: USSummaryStats;
    flock_cases_by_state: FlockCasesByState[];
}

export { LatestFlockData };
