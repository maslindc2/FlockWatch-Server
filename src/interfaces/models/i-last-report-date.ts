/**
 * This interface is for keeping track of when to update the database
 */
import Mongoose, { Date } from "mongoose";
interface ILastReportDate extends Mongoose.Document {
    lastScrapedDate: Date; // Stores the last date this was updated
    authID: string;
}
export { ILastReportDate };
