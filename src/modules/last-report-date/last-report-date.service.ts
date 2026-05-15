import { LastReportDateModel } from "./last-report-date.model";
import { logger } from "../../utils/winston-logger";

/**
 * Service for tracking when data was last synced from the scraping service.
 * Manages the last scraped date and the rotating auth_id used for scraper authentication.
 */
class LastReportDateService {
    /**
     * Retrieve the last scraped date (hides auth_id and internal Mongoose fields).
     * @returns The last scraped date document, or null if not found.
     */
    public async getLastScrapedDate() {
        return LastReportDateModel.getModel
            .findOne({ last_scraped_date: { $exists: true } })
            .select("-_id -__v -auth_id")
            .lean();
    }
    /**
     * Retrieve the current auth_id used for authenticating with the scraping service.
     * @returns The auth_id document, or null if not found.
     */
    public async getAuthID() {
        return LastReportDateModel.getModel
            .findOne({ auth_id: { $exists: true } })
            .select("-_id -__v -last_scraped_date")
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
                last_scraped_date: new Date(0),
                auth_id: crypto.randomUUID(),
            };
            // Create and return the document we created
            return (
                await LastReportDateModel.getModel.create(modelObj)
            ).toObject();
        }
        return existingRecord;
    }

    /**
     * Create or update the last report date document.
     * On a successful update, records the current timestamp and generates a new auth_id.
     * On a failed update, only refreshes the auth_id.
     * @param isSuccessfulUpdate Whether the preceding data update succeeded.
     */
    public async updateLastReportDate(isSuccessfulUpdate: boolean) {
        // Model object contains today's timestamp, and the newly created authID
        let modelObj;
        if (isSuccessfulUpdate) {
            modelObj = {
                last_scraped_date: new Date(),
                auth_id: crypto.randomUUID(),
            };
        } else {
            modelObj = {
                auth_id: crypto.randomUUID(),
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
