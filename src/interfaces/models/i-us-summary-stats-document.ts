/**
 * This interface is responsible for US Summary Statistics.
 * CSV to use is "Map Comparisons.csv"
 * - Sum up the below columns
 * -- "State Names" creates totalStatesAffected
 * -- "Birds Affected" creates totalBirdsAffectedNationwide
 * -- "Total Flocks" creates totalFlocksAffectedNationwide
 * -- "Backyard Flocks" creates totalBackyardFlocksNationwide
 * -- "Commercial Flocks" creates totalCommercialFlocksNationwide
 */
import Mongoose from "mongoose";
import { IUSSummaryStats } from "../i-us-summary-stats";

interface IUSSummaryStatsDocument extends IUSSummaryStats, Mongoose.Document {}
export { IUSSummaryStatsDocument };
