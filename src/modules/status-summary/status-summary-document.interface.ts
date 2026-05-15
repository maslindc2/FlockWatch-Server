import Mongoose from "mongoose";
import { StatusSummary } from "./status-summary.interface";

/**
 * Mongoose document interface for StatusSummary, combining the base interface with Mongoose.Document methods.
 */
interface StatusSummaryDocument extends StatusSummary, Mongoose.Document {}
export type { StatusSummaryDocument };
