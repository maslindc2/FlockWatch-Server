import * as Mongoose from "mongoose";
import { IFlockCasesByState } from "../interfaces/i-flock-cases-by-state";

class FlockCasesByStateModel {
    private static schema = new Mongoose.Schema<IFlockCasesByState>({
        state: {type: String, required: true},
        totalBirdsAffected: {type: Number, required: true},
        totalFlocksAffected: {type: Number, required: true},
        commercialFlocksAffected: {type: Number, required: true},
        backyardFlocksAffected: {type: Number, required: true},
        birdsPerFlock: {type: Number, required: true},
        lastReportedDate: {type: Date, required: true},
        latitude: {type: Number, required: true},
        longitude: {type: Number, required: true},
    });

    public static getModel = Mongoose.model<IFlockCasesByState>(
        "FlockCasesByState",
        FlockCasesByStateModel.schema
    );
}
export { FlockCasesByStateModel };
