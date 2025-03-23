import * as Mongoose from "mongoose";
import { ILastReportDate } from "../interfaces/i-last-report-date";

/**
 * This model is used for scheduling scrape jobs currently USDA updates weekdays by 12 pm eastern time.
 * We can use lastScrapeDate to determine if the scrapers need to run or not
 * currentUpdateTime will store the USDA update time in this case 12PM EST
 */
class LastReportDateModel {
    private static schema = new Mongoose.Schema<ILastReportDate>({
        lastScrapedDate: Date,
        currentUpdateTime: Number,
    });

    public static getModel = Mongoose.model<ILastReportDate>(
        "last-report-date",
        this.schema
    );
}

export { LastReportDateModel };
