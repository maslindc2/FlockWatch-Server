/**
 * This interface is responsible for US Summary Statistics.
 * CSV to use is "Map Comparisons.csv"
 * - Sum up the below columns
 * -- "State Names" creates totalStatesAffected
 * -- "Birds Affected" creates totalBirdsAffectedNationwide
 * -- "Total Flocks" creates totalFlocksAffectedNationwide
 * -- "Backyard Flocks" creates totalBackyardFlocksNationwide
 * -- "Commercial Flocks" creates totalCommercialFlocksNationwide
 */
interface IUSSummaryStats {
    totalStatesAffected: number; // Number of states with infections
    totalBirdsAffectedNationwide: number; // Total birds affected nationwide
    totalFlocksAffectedNationwide: number; // Total flocks affected nationwide
    totalBackyardFlocksNationwide: number; // Backyard flocks affected nationwide
    totalCommercialFlocksNationwide: number; // Commercial flocks affected nationwide
}
export { IUSSummaryStats };
