import * as Mongoose from "mongoose";
import { ILastReportDate } from "../interfaces/ILastReportDate";
import { logger } from "../utils/winstonLogger";

class LastReportDateModel {
    public schema: any;
    public model: any;
    public dbConnectionString: string;

    public constructor(DB_CONNECTION_STRING: string) {
        this.dbConnectionString = DB_CONNECTION_STRING;
        this.createSchema();
    }
    public createSchema() {
        this.schema = new Mongoose.Schema({
            lastScrapedDate: Number, // Number of states with infections
            currentUpdateTime: Number, // Total birds affected nationwide
        });
        {
            collection: "LastReportDateModel";
        }
    }
    public async createModel() {
        try {
            await Mongoose.connect(this.dbConnectionString);
            if (Mongoose.models.LastReportDateModel) {
                this.model = Mongoose.model<ILastReportDate>(
                    "LastReportDateModel"
                );
            } else {
                this.model = Mongoose.model<ILastReportDate>(
                    "LastReportDateModel",
                    this.schema
                );
            }
        } catch (error) {
            logger.error(error);
        }
    }
}
export { LastReportDateModel };
