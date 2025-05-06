import { LastReportDateModel } from "../../models/last-report-date-model";

class LastReportDateService {
    // This will query the last report date model and only return the last scraped date field
    public async getLastScrapedDate() {
        return LastReportDateModel.getModel
            .findOne({ lastScrapedDate: { $exists: true } })
            .select("-_id -__v -authID");
    }
    // Only get the authID and hide the id, version, and last scraped date field
    public async getAuthID() {
        return LastReportDateModel.getModel
            .findOne({ authID: { $exists: true } })
            .select("-_id -__v -lastScrapedDate");
    }
    /**
     * On server start this will be executed, if mongoDB is being created for the first time
     * this will create an entry with the date last scraped, scrape frequency, and auth id.
     */
    public async initializeLastReportDate() {
        // Check for an existing last report date model
        const existingRecord = await LastReportDateModel.getModel.findOne();
        // If none exists
        if (!existingRecord) {
            // Create one and set the date to Unix epoch which is January 1, 1970
            // with a random UUID for the auth id
            const modelObj = {
                lastScrapedDate: new Date(0),
                authID: crypto.randomUUID(),
            };
            // Create and return the document we created
            return await LastReportDateModel.getModel.create(modelObj);
        } else {
            // Return the existing record
            return existingRecord;
        }
    }

    // Create or update the last report date document
    public async createOrUpdateLastReportDate() {
        // Model object contains today's timestamp, and the newly created authID
        const modelObj = {
            lastScrapedDate: new Date(),
            authID: crypto.randomUUID(),
        };
        // Upsert or update the last report date entry
        return await LastReportDateModel.getModel.findOneAndUpdate(
            {},
            modelObj,
            { upsert: true }
        );
    }
}
export { LastReportDateService };
