import * as Mongoose from "mongoose";
import { SiteDetailsDocument } from "./site-details-document.interface";

/**
 * Mongoose model for site details. Each document represents a premises
 * with avian influenza, tracking its status, location, and impact.
 */
class SiteDetailsModel {
    private static schema = new Mongoose.Schema<SiteDetailsDocument>(
        {
            special_id: { type: String, required: true, unique: true },
            county: { type: String, required: true },
            state: { type: String, required: true },
            production_type: { type: String, required: true, index: true },
            confirmed_diagnosis_date: { type: Date, required: true },
            status: { type: String, required: true, index: true },
            birds_affected: { type: Number, required: true },
        },
        { collection: "site-details" }
    );

    /** The Mongoose model instance for the site-details collection. */
    public static getModel = Mongoose.model<SiteDetailsDocument>(
        "site-details",
        SiteDetailsModel.schema
    );
}
export { SiteDetailsModel };
