import * as Mongoose from "mongoose";
import { ILastReportDate } from "../interfaces/models/i-last-report-date";

/**
 * This model is used for scheduling scrape jobs currently USDA updates weekdays by 12 pm eastern time.
 * lastScrapeDate is the last time we collected data, used to determine if the scrapers need to run or not
 * updateFrequency will store the USDA update time in this case 12PM EST this might change in the future when we build the auto update service
 */
class LastReportDateModel {
    private static schema = new Mongoose.Schema<ILastReportDate>(
        {
            lastScrapedDate: Date,
            updateFrequency: Number,
            authID: String,
        },
        { collection: "last-report-date" }
    );

    public static getModel = Mongoose.model<ILastReportDate>(
        "last-report-date",
        this.schema
    );
}

export { LastReportDateModel };
