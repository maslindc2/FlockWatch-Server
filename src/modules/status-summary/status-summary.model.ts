import * as Mongoose from "mongoose";
import { StatusSummaryDocument } from "./status-summary-document.interface";

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

    public static getModel = Mongoose.model<StatusSummaryDocument>(
        "status-summary",
        StatusSummaryModel.schema
    );
}
export { StatusSummaryModel };
