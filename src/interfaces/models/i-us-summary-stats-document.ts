import Mongoose from "mongoose";
import { IUSSummaryStats } from "../i-us-summary-stats";
// Since we already define the IUSSummaryStats we can reuse it to make our document interface
interface IUSSummaryStatsDocument extends IUSSummaryStats, Mongoose.Document {}
export { IUSSummaryStatsDocument };
