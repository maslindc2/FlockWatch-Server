/**
 * This interface is responsible for US Summary Statistics.
 * This will track the number of states affected
 * Total Birds Affected by it
 * Total Flocks Affected by it
 * Total Backyard Flocks Affected by it
 * Total Commercial Flocks Nationwide
 */
import Mongoose from "mongoose";

interface IUSSummaryStats extends Mongoose.Document {
    totalStatesAffected: number; // Number of states with infections
    totalBirdsAffectedNationwide: number; // Total birds affected nationwide
    totalFlocksAffectedNationwide: number; // Total flocks affected nationwide
    totalBackyardFlocksNationwide: number; // Backyard flocks affected nationwide
    totalCommercialFlocksNationwide: number; // Commercial flocks affected nationwide
}
export { IUSSummaryStats };
