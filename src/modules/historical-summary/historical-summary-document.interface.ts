import Mongoose from "mongoose";
import { HistoricalSummary } from "./historical-summary.interface";

interface HistoricalSummaryDocument
    extends HistoricalSummary, Mongoose.Document {}
export type { HistoricalSummaryDocument };
