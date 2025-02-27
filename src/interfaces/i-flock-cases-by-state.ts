/**
 * This interface is for flock cases for each individual state
 * CSV to use is "Map Comparisons.csv"
 *
 * We will capture the state name, birds affected, flocks affected, commercial and backyard flocks, birds per flock, reported date
 * and latitude longitude of the state for our map view.
 * Birds Per Flock is used to gauge outbreak intensity it's just a rough estimate it might be completely meaningless though
 * Birds Per Flock = Total Birds Affected (Statewide) / Total Flocks Affected (statewide)
 */
import Mongoose from "mongoose";

interface IFlockCasesByState extends Mongoose.Document {
    stateAbbreviation: string; // e.g. TX or WA
    state: string; // e.g. "Texas" or "California"
    totalBirdsAffected: number; // Total birds affected in the state
    totalFlocksAffected: number; // Total infected flocks in the state
    commercialFlocksAffected: number; // Number of affected commercial flocks
    backyardFlocksAffected: number; // Number of affected backyard flocks
    birdsPerFlock: number; // Birds per flock (if total flocks > 0, otherwise null) see formula above
    lastReportedDate: Date; // Most recent case detection date
    latitude: number;
    longitude: number;
}
export { IFlockCasesByState };
