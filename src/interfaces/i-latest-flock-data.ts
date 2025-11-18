import { IFlockCasesByState } from "./i-flock-cases-by-state";
import { IUSSummaryStats } from "./i-us-summary-stats";

// This is the data type for object that we get from our scraping service
interface ILatestFlockData {
    us_summary_stats: IUSSummaryStats;
    flock_cases_by_state: IFlockCasesByState[];
}

export { ILatestFlockData };
