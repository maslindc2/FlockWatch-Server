import * as Mongoose from "mongoose";
import { ILastReportDate } from "../interfaces/ILastReportDate";

class LastReportDateModel {
    private static schema = new Mongoose.Schema<ILastReportDate>({
        lastScrapedDate: Date,
        currentUpdateTime: Date,
    });

    public static model = Mongoose.model<ILastReportDate>(
        "LastReportDate",
        this.schema
    );

    public static async getLastReportDate() {
        return this.model.find({}).select("-_id -__v");
    }
}

export { LastReportDateModel };
