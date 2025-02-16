import * as Mongoose from "mongoose";
import { IFlockCasesByState } from "../interfaces/IFlockCasesByState";
import { DatabaseService } from "../services/DatabaseService";
import { logger } from "../utils/winstonLogger";

class FlockCasesByStateModel {
    private schema!: Mongoose.Schema;
    private model!: Mongoose.Model<IFlockCasesByState>;

    public constructor() {
        this.createSchema();
    }

    private createSchema(): void {
        this.schema = new Mongoose.Schema({
            state: String,
            totalBirdsAffected: Number,
            totalFlocksAffected: Number,
            commercialFlocksAffected: Number,
            backyardFlocksAffected: Number,
            birdsPerFlock: Number,
            lastReportedDate: Date,
            latitude: Number,
            longitude: Number,
        }, { collection: "FlockCasesByState" });
    }

    public async createModel(): Promise<void> {
        try {
            await DatabaseService.connect(process.env.MONGODB_URI!);  // Ensure connection
            this.model = Mongoose.model<IFlockCasesByState>("FlockCasesByState", this.schema);
        } catch (error) {
            logger.error("Error in createModel:", error);
        }
    }

    // Add other methods for CRUD operations here (e.g., save, find, etc.)
}

export { FlockCasesByStateModel };
