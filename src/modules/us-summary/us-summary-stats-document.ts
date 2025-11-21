import Mongoose from "mongoose";
import { USSummaryStats } from "./us-summary-stats.interface";
// Since we already define the IUSSummaryStats we can reuse it to make our document interface
interface USSummaryStatsDocument extends USSummaryStats, Mongoose.Document {}
export { USSummaryStatsDocument };
