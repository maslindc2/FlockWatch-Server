import Mongoose from "mongoose";
import { USSummaryStats } from "./us-summary-stats.interface";

/**
 * Mongoose document interface for USSummaryStats, combining the base interface with Mongoose.Document methods.
 */
interface USSummaryStatsDocument extends USSummaryStats, Mongoose.Document {}
export type { USSummaryStatsDocument };
