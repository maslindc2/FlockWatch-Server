import * as Mongoose from "mongoose";
import { HistoricalSummaryDocument } from "./historical-summary-document.interface";

/**
 * Mongoose model for the historical summary document storing all-time
 * aggregated statistics about avian influenza impact.
 */
class HistoricalSummaryModel {
    private static schema = new Mongoose.Schema<HistoricalSummaryDocument>(
        {
            key: {
                type: String,
                required: true,
                unique: true,
                default: "historical-summary",
            },
            total_birds_affected_all_time: { type: Number, required: true },
            total_sites_all_time: { type: Number, required: true },
            total_active_sites: { type: Number, required: true },
            total_released_sites: { type: Number, required: true },
            total_na_sites: { type: Number, required: true },
            total_birds_active: { type: Number, required: true },
        },
        { collection: "historical-summary" }
    );

    /** The Mongoose model instance for the historical-summary collection. */
    public static getModel = Mongoose.model<HistoricalSummaryDocument>(
        "historical-summary",
        HistoricalSummaryModel.schema
    );
}
export { HistoricalSummaryModel };
