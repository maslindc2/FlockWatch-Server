import * as Mongoose from "mongoose";
import { StatusSummaryDocument } from "./status-summary-document.interface";

/**
 * Mongoose model for the status summary document storing 30-day rolling
 * statistics about confirmed sites, released sites, and birds affected.
 */
class StatusSummaryModel {
    private static schema = new Mongoose.Schema<StatusSummaryDocument>(
        {
            key: {
                type: String,
                required: true,
                unique: true,
                default: "status-summary",
            },
            sites_confirmed_last_30_days: { type: Number, required: true },
            sites_released_last_30_days: { type: Number, required: true },
            birds_affected_last_30_days: { type: Number, required: true },
        },
        { collection: "status-summary" }
    );

    /** The Mongoose model instance for the status-summary collection. */
    public static getModel = Mongoose.model<StatusSummaryDocument>(
        "status-summary",
        StatusSummaryModel.schema
    );
}
export { StatusSummaryModel };
