import { LastReportDateModel } from "../../models/last-report-date-model";

class LastReportDateService {
    // This will query the last report date model and only return the last scraped date field
    public async getLastScrapedDate() {
        return LastReportDateModel.getModel
            .findOne({ lastScrapedDate: { $exists: true } })
            .select("-_id -__v -authID");
    }
    // Only get the authID
    public async getAuthID() {
        return LastReportDateModel.getModel
            .findOne({ authID: { $exists: true } })
            .select("-_id -__v -lastScrapedDate");
    }
    /**
     * On server start this will be executed, if the mongoDB is being created for the first time
     * This will create an entry with the date last scraped, scrape frequency, and auth id.
     */
    public async initializeLastReportDate() {
        const existingRecord = await LastReportDateModel.getModel.findOne();
        if (!existingRecord) {
            const modelObj = {
                lastScrapedDate: new Date(0),
                authID: crypto.randomUUID(),
            };
            return await LastReportDateModel.getModel.create(modelObj);
        } else {
            return existingRecord;
        }
    }

    // Create or update the last report date document
    public async createOrUpdateLastReportDate() {
        // Model object contains today's timestamp, update frequency, and the newly created authID
        const modelObj = {
            lastScrapedDate: new Date(),
            authID: crypto.randomUUID(),
        };
        return await LastReportDateModel.getModel.findOneAndUpdate(
            {},
            modelObj,
            { upsert: true }
        );
    }
}
export { LastReportDateService };
