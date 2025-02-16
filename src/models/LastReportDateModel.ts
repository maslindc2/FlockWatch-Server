import * as Mongoose from "mongoose";
import { ILastReportDate } from "../interfaces/ILastReportDate";
import { DatabaseService } from "../services/DatabaseService";
import { logger } from "../utils/winstonLogger";

class LastReportDateModel {
    private schema!: Mongoose.Schema;
    private model!: Mongoose.Model<ILastReportDate>;

    public constructor() {
        this.createSchema();
    }

    private createSchema(): void {
        this.schema = new Mongoose.Schema({
            lastScrapedDate: Number,  // Stores the last date this was updated
            currentUpdateTime: Number, // USDA updates weekdays at 12pm EST
        }, { collection: "LastReportDateModel" });
    }

    public async createModel(): Promise<void> {
        try {
            await DatabaseService.connect(process.env.MONGODB_URI!);  // Ensure connection
            this.model = Mongoose.model<ILastReportDate>("LastReportDateModel", this.schema);
        } catch (error) {
            logger.error("Error in createModel:", error);
        }
    }

    public async getLastReportDate(): Promise<ILastReportDate | null> {
        try {
            const reportDateInfo = await this.model.findOne().exec();
            return reportDateInfo;
        } catch (error) {
            logger.error("Error fetching last report date:", error);
            throw error;
        }
    }
}

export { LastReportDateModel };
