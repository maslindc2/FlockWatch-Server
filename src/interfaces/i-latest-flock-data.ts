import { IFlockCasesByState } from "./i-flock-cases-by-state";
import { IUSSummaryStats } from "./i-us-summary-stats";

interface ILatestFlockData {
    usSummaryStats: IUSSummaryStats,
    flockCasesByState: IFlockCasesByState[]
}

export {ILatestFlockData}