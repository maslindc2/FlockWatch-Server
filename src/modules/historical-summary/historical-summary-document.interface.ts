import Mongoose from "mongoose";
import { HistoricalSummary } from "./historical-summary.interface";

/**
 * Mongoose document interface for HistoricalSummary, combining the base interface with Mongoose.Document methods.
 */
interface HistoricalSummaryDocument
    extends HistoricalSummary, Mongoose.Document {}
export type { HistoricalSummaryDocument };
