import * as Mongoose from "mongoose";
import { IFlockCasesByState } from "../interfaces/IFlockCasesByState";
import { logger } from "../utils/winstonLogger";

class FlockCasesByStateModel {
    public schema: any;
    public model: any;
    public dbConnectionString: string;

    public constructor(DB_CONNECTION_STRING: string) {
        this.dbConnectionString = DB_CONNECTION_STRING;
        this.createSchema();
    }

    public createSchema() {
        this.schema = new Mongoose.Schema({
            state: String, // e.g., "Texas", "CA"
            totalBirdsAffected: Number, // Total birds affected in the state
            totalFlocksAffected: Number, // Total infected flocks in the state
            commercialFlocksAffected: Number, // Number of affected commercial flocks
            backyardFlocksAffected: Number, // Number of affected backyard flocks
            birdsPerFlock: Number, // Birds per flock (if total flocks > 0, otherwise -1) see formula above
            lastReportedDate: Date, // Most recent case detection date
            latitude: Number,
            longitude: Number,
        });
        {
            collection: "FlockCasesByState";
        }
    }

    public async createModel() {
        try {
            await Mongoose.connect(this.dbConnectionString);
            if (Mongoose.models.FlockCasesByState) {
                this.model =
                    Mongoose.model<IFlockCasesByState>("FlockCasesByState");
            } else {
                this.model = Mongoose.model<IFlockCasesByState>(
                    "FlockCasesByState",
                    this.schema
                );
            }
        } catch (error) {
            logger.error(error);
        }
    }
}
export { FlockCasesByStateModel };
