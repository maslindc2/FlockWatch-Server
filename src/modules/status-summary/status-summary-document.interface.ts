import Mongoose from "mongoose";
import { StatusSummary } from "./status-summary.interface";

interface StatusSummaryDocument extends StatusSummary, Mongoose.Document {}
export type { StatusSummaryDocument };
