import * as Mongoose from "mongoose";
import { ILastReportDate } from "../interfaces/i-last-report-date";

class LastReportDateModel {
    private static schema = new Mongoose.Schema<ILastReportDate>({
        lastScrapedDate: Date,
        currentUpdateTime: Date,
    });

    public static getModel = Mongoose.model<ILastReportDate>(
        "LastReportDate",
        this.schema
    );
}

export { LastReportDateModel };
