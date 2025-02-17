import * as Mongoose from "mongoose";
import { IFlockCasesByState } from "../interfaces/IFlockCasesByState";

class FlockCasesByStateModel {
    private static schema = new Mongoose.Schema<IFlockCasesByState>({
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

    public static model = Mongoose.model<IFlockCasesByState>(
        "FlockCasesByState",
        FlockCasesByStateModel.schema
    );
}
export { FlockCasesByStateModel };
