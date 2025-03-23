import * as Mongoose from "mongoose";
import { IUSSummaryStats } from "../interfaces/i-us-summary-stats";

/**
 * USSummary Model this model contains the highlight information about the current status of Avian Flu
 * All entries are created by summing columns in the Map Comparisons.csv file
 * - totalStatesAffected created by summing the State Name Columns that have detections
 * - totalBirdsAffectedNationwide created by summing the Birds Affected column
 * - totalFlocksAffectedNationwide created by summing the Total Flocks column
 * - totalBackyardFlocksNationwide created by summing the Backyard Flocks column
 * - totalCommercialFlocksNationwide created by summing the Commercial Flocks column
 */
class USSummaryModel {
    private static schema = new Mongoose.Schema<IUSSummaryStats>({
        totalStatesAffected: Number,
        totalBirdsAffectedNationwide: Number,
        totalFlocksAffectedNationwide: Number,
        totalBackyardFlocksNationwide: Number,
        totalCommercialFlocksNationwide: Number,
    });
    public static getModel = Mongoose.model<IUSSummaryStats>(
        "us-summary",
        this.schema
    );
}

export { USSummaryModel };
