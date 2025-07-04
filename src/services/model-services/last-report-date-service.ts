import { model } from "mongoose";
import { LastReportDateModel } from "../../models/last-report-date-model";
import { logger } from "../../utils/winston-logger";

class LastReportDateService {
    // This will query the last report date model and only return the last scraped date field
    public async getLastScrapedDate() {
        return LastReportDateModel.getModel
            .findOne({ lastScrapedDate: { $exists: true } })
            .select("-_id -__v -authID")
            .lean();
    }
    // Only get the authID and hide the id, version, and last scraped date field
    public async getAuthID() {
        return LastReportDateModel.getModel
            .findOne({ authID: { $exists: true } })
            .select("-_id -__v -lastScrapedDate")
            .lean();
    }
    /**
     * On server start this will be executed, if mongoDB is being created for the first time
     * this will create an entry with the date last scraped, scrape frequency, and auth id.
     */
    public async initializeLastReportDate() {
        // Check for an existing last report date model
        const existingRecord = await LastReportDateModel.getModel
            .findOne()
            .lean();

        // If none exists
        if (!existingRecord) {
            // Create one and set the date to Unix epoch which is January 1, 1970
            // with a random UUID for the auth id
            const modelObj = {
                lastScrapedDate: new Date(0),
                authID: crypto.randomUUID(),
            };
            // Create and return the document we created
            return (
                await LastReportDateModel.getModel.create(modelObj)
            ).toObject();
        }
        return existingRecord;
    }

    // Create or update the last report date document
    public async updateLastReportDate(isSuccessfulUpdate: Boolean) {
        // Model object contains today's timestamp, and the newly created authID
        let modelObj;
        if (isSuccessfulUpdate) {
            modelObj = {
                lastScrapedDate: new Date(),
                authID: crypto.randomUUID(),
            };
        } else {
            modelObj = {
                authID: crypto.randomUUID(),
            };
        }
        try {
            // Update the last report date entry
            await LastReportDateModel.getModel.updateOne({}, modelObj);
        } catch (error) {
            logger.error(
                `Failed to update the last report date model! Received isSuccessfulUpdate bool value of ${isSuccessfulUpdate} resulted in: ${error}`
            );
            throw new Error("Failed to update the last report date model!");
        }
    }
}
export { LastReportDateService };
