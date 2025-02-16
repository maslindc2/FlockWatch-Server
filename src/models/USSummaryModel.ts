import * as Mongoose from "mongoose";
import { IUSSummaryStats } from "../interfaces/IUSSummaryStats";
import { DatabaseService } from "../services/DatabaseService";
import { logger } from "../utils/winstonLogger";

class USSummaryModel {
    private schema!: Mongoose.Schema;
    private model!: Mongoose.Model<IUSSummaryStats>;

    public constructor() {
        this.createSchema();
    }

    private createSchema(): void {
        this.schema = new Mongoose.Schema({
            totalStatesAffected: Number,
            totalBirdsAffectedNationwide: Number,
            totalFlocksAffectedNationwide: Number,
            totalBackyardFlocksNationwide: Number,
            totalCommercialFlocksNationwide: Number,
        }, { collection: "USSummary" });
    }

    public async createModel(): Promise<void> {
        try {
            await DatabaseService.connect(process.env.MONGODB_URI!);  // Ensure connection
            this.model = Mongoose.model<IUSSummaryStats>("USSummary", this.schema);
        } catch (error) {
            logger.error("Error in createModel:", error);
        }
    }

    // Example method: You can add methods for fetching or modifying data
    public async getUSSummary(): Promise<IUSSummaryStats | null> {
        try {
            const summaryData = await this.model.findOne().exec();
            return summaryData;
        } catch (error) {
            logger.error("Error fetching US summary:", error);
            throw error;
        }
    }
}

export { USSummaryModel };
