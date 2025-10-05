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
    totalStatesAffected: number; // Number of states with infections
    totalBirdsAffected: number; // Total birds affected
    totalFlocksAffected: number; // Total flocks affected
    totalBackyardFlocksAffected: number; // Backyard flocks affected
    totalCommercialFlocksAffected: number; // Commercial flocks affected
}

interface IPeriodSummary {
    periodName: string;
    totalBirdsAffected: number; // Total birds affected for that period
    totalFlocksAffected: number; // Total flocks affected for that period
    totalBackyardFlocksAffected: number; // Backyard flocks affected for that period
    totalCommercialFlocksAffected: number; // Commercial flocks affected for that period
}

interface IUSSummaryStats {
    key: string;
    allTimeTotals: IAllTimeTotals;
    periodSummaries: IPeriodSummary[];
}

export { IAllTimeTotals, IPeriodSummary, IUSSummaryStats };
