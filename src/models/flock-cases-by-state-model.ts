import * as Mongoose from "mongoose";
import { IFlockCasesByStateDocument } from "../interfaces/models/i-flock-cases-by-state-document";

/**
 * This model stores each individual state's Avian Flu detections.
 * All of this data is found in Map Comparisons.csv file we only skip the State Label and Color columns
 */
class FlockCasesByStateModel {
    private static schema = new Mongoose.Schema<IFlockCasesByStateDocument>({
        stateAbbreviation: String,
        state: String,
        backyardFlocks: Number,
        commercialFlocks: Number,
        birdsAffected: Number,
        totalFlocks: Number,
        latitude: Number,
        longitude: Number,
        lastReportedDate: Date
    }, { collection: "flock-cases-by-state"});

    public static getModel = Mongoose.model<IFlockCasesByStateDocument>(
        "flock-cases-by-state",
        FlockCasesByStateModel.schema
    );
}
export { FlockCasesByStateModel };
