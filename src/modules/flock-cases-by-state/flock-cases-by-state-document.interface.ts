import Mongoose from "mongoose";
import { FlockCasesByState } from "./flock-cases-by-state.interface";

/**
 * Mongoose document interface for FlockCasesByState, combining the base interface with Mongoose.Document methods.
 */
interface FlockCasesByStateDocument
    extends FlockCasesByState, Mongoose.Document {}
export type { FlockCasesByStateDocument };
