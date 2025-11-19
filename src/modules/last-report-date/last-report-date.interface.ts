/**
 * This interface is for keeping track of when to update the database
 */
import Mongoose, { Date } from "mongoose";
interface LastReportDate extends Mongoose.Document {
    last_scraped_date: Date; // Stores the last date this was updated
    auth_id: string;
}
export { LastReportDate };
