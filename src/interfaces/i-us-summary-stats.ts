/**
 * This interface is responsible for US Summary Statistics.
 * CSV to use is "Map Comparisons.csv", "Affected Totals.csv", "Confirmed Flocks Total.csv"
 *
 * - Sum up the below columns to create the AllTimeTotals
 * -- "State Names" creates totalStatesAffected
 * -- "Birds Affected" creates totalBirdsAffectedNationwide
 * -- "Total Flocks" creates totalFlocksAffectedNationwide
 * -- "Backyard Flocks" creates totalBackyardFlocksNationwide
 * -- "Commercial Flocks" creates totalCommercialFlocksNationwide
 */
interface IAllTimeTotals {
    total_states_affected: number; // Number of states with infections
    total_birds_affected: number; // Total birds affected
    total_flocks_affected: number; // Total flocks affected
    total_backyard_flocks_affected: number; // Backyard flocks affected
    total_commercial_flocks_affected: number; // Commercial flocks affected
}

interface IPeriodSummary {
    period_name: string;
    total_birds_affected: number; // Total birds affected for that period
    total_flocks_affected: number; // Total flocks affected for that period
    total_backyard_flocks_affected: number; // Backyard flocks affected for that period
    total_commercial_flocks_affected: number; // Commercial flocks affected for that period
}

interface IUSSummaryStats {
    key: string;
    all_time_totals: IAllTimeTotals;
    period_summaries: IPeriodSummary[];
}

export { IAllTimeTotals, IPeriodSummary, IUSSummaryStats };
