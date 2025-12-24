import { FlockCasesByState } from "../flock-cases-by-state/flock-cases-by-state.interface";
import { AllTimeTotals, PeriodSummary, USSummaryStats } from "../us-summary/us-summary-stats.interface";

class BuildUSSummary {
    /**
     * Assemble the US Summary Stats by summing the total birds affected, flocks affected, backyard flocks, and commercial flocks
     * @param jsonFromScraper Array containing all US State's Avian Influenza data
     * @returns JS Object containing the US Summary Stats of type USSummaryStats
     */
    public createUSSummaryData(
        flock_cases_by_state: FlockCasesByState[],
        period_summaries: PeriodSummary[]
    ): USSummaryStats {
        const all_time_totals: AllTimeTotals = {
            total_states_affected: 0,
            total_birds_affected: 0,
            total_flocks_affected: 0,
            total_backyard_flocks_affected: 0,
            total_commercial_flocks_affected: 0,
        };

        // For each state object populate the usSummaryStats by iterating through each states individual data
        flock_cases_by_state.forEach((stateObj) => {
            // Since Scraper only sends data for states that have outbreaks...
            // we can safely increment the totalStatesAffected by 1 for each state object
            all_time_totals.total_states_affected += 1;
            all_time_totals.total_birds_affected += stateObj.birds_affected;
            all_time_totals.total_flocks_affected += stateObj.total_flocks;
            all_time_totals.total_backyard_flocks_affected +=
                stateObj.backyard_flocks;
            all_time_totals.total_commercial_flocks_affected +=
                stateObj.commercial_flocks;
        });

        return {
            key: "us-summary",
            all_time_totals,
            period_summaries,
        };
    }
}
export {BuildUSSummary}