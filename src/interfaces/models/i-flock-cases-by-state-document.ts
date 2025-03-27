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
import { IFlockCasesByState } from "../i-flock-cases-by-state";

interface IFlockCasesByStateDocument extends IFlockCasesByState, Mongoose.Document {}
export { IFlockCasesByStateDocument };
