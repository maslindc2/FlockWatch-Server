import * as Mongoose from "mongoose";
import { IFlockCasesByState } from "../interfaces/i-flock-cases-by-state";

/**
 * This model stores each individual state's Avian Flu detections.
 * All of this data is found in Map Comparisons.csv file we only skip the State Label and Color columns
 */
class FlockCasesByStateModel {
    private static schema = new Mongoose.Schema<IFlockCasesByState>({
        stateAbbreviation: String,
        state: String,
        totalBirdsAffected: Number,
        totalFlocksAffected: Number,
        commercialFlocksAffected: Number,
        backyardFlocksAffected: Number,
        birdsPerFlock: Number,
        lastReportedDate: Date,
        latitude: Number,
        longitude: Number,
    });

    public static getModel = Mongoose.model<IFlockCasesByState>(
        "flock-cases-by-state",
        FlockCasesByStateModel.schema
    );
}
export { FlockCasesByStateModel };
