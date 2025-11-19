import * as Mongoose from "mongoose";
import { LastReportDate } from "./last-report-date.interface";

/**
 * This model is used for scheduling scrape jobs currently USDA updates weekdays by 12 pm eastern time.
 * lastScrapeDate is the last time we collected data, used to determine if the scrapers need to run or not
 * updateFrequency will store the USDA update time in this case 12PM EST this might change in the future when we build the auto update service
 */
class LastReportDateModel {
    private static schema = new Mongoose.Schema<LastReportDate>(
        {
            last_scraped_date: { type: Date, index: true },
            auth_id: { type: String, index: true },
        },
        { collection: "last-report-date" }
    );

    public static getModel = Mongoose.model<LastReportDate>(
        "last-report-date",
        this.schema
    );
    static findOne: any;
}

export { LastReportDateModel };
