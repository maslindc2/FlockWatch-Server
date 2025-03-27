import { IFlockCasesByState } from "./i-flock-cases-by-state";

interface IUSSummaryStats {
    totalStatesAffected: number; // Number of states with infections
    totalBirdsAffectedNationwide: number; // Total birds affected nationwide
    totalFlocksAffectedNationwide: number; // Total flocks affected nationwide
    totalBackyardFlocksNationwide: number; // Backyard flocks affected nationwide
    totalCommercialFlocksNationwide: number; // Commercial flocks affected nationwide
}
export {IUSSummaryStats};