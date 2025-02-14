/**
 * This interface is for keeping track of when to update the database
 */
import Mongoose, { Date }  from "mongoose"

interface ILastReportDate extends Mongoose.Document {
    lastScrapedDate: Date // Stores the last date this was updated
    currentUpdateTime: Date // USDA updates weekdays at 12pm E.S.T (UTC-5) 9am PST (UTC-8)
}
export {ILastReportDate}