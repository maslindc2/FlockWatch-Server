import * as Mongoose from "mongoose";
import { FlockCasesByStateDocument } from "./flock-cases-by-state-document.interface";

/**
 * This model stores each individual state's Avian Flu detections.
 * All of this data is found in Map Comparisons.csv file we only skip the State Label and Color columns
 */
class FlockCasesByStateModel {
    private static schema = new Mongoose.Schema<FlockCasesByStateDocument>(
        {
            state_abbreviation: { type: String, index: true },
            state: String,
            backyard_flocks: Number,
            commercial_flocks: Number,
            birds_affected: Number,
            total_flocks: Number,
            latitude: Number,
            longitude: Number,
            last_reported_detection: Date,
        },
        { collection: "flock-cases-by-state" }
    );

    public static getModel = Mongoose.model<FlockCasesByStateDocument>(
        "flock-cases-by-state",
        FlockCasesByStateModel.schema
    );
}
export { FlockCasesByStateModel };
