/**
 * This interface is for keeping track of when to update the database
 */
import Mongoose, { Date } from "mongoose";
interface ILastReportDate extends Mongoose.Document {
    lastScrapedDate: Date; // Stores the last date this was updated
    updateFrequency: Number; // USDA updates weekdays at 12pm E.S.T (UTC-5) 9am PST (UTC-8) this will equal 9 for now but update to include time zone offset
    authID: String;
}
export { ILastReportDate };
