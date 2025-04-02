import * as Mongoose from "mongoose";
import { IUSSummaryStatsDocument } from "../interfaces/models/i-us-summary-stats-document";

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
    private static schema = new Mongoose.Schema<IUSSummaryStatsDocument>({
        totalStatesAffected: Number,
        totalBirdsAffectedNationwide: Number,
        totalFlocksAffectedNationwide: Number,
        totalBackyardFlocksNationwide: Number,
        totalCommercialFlocksNationwide: Number,
    }, {collection: "us-summary"});
    public static getModel = Mongoose.model<IUSSummaryStatsDocument>(
        "us-summary",
        this.schema
    );
}

export { USSummaryModel };
