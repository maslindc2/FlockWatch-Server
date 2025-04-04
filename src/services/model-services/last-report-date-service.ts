import { LastReportDateModel } from "../../models/last-report-date-model";
import { logger } from "../../utils/winston-logger";

class LastReportDateService {
    // This will query the last report date model and only return the last scraped date and the update frequency fields
    public async getLastReportDate() {
        return LastReportDateModel.getModel
            .find({})
            .select("-_id -__v -authID");
    }
    // Only get the authID
    public async getAuthID() {
        return LastReportDateModel.getModel.find({ authID: { $exists: true } });
    }
    /**
     * On server start this will be executed, if the mongoDB is being created for the first time
     * This will create an entry with the date last scraped, scrape frequency, and auth id.
     */
    public async initializeLastReportDate() {
        const existingRecord = await LastReportDateModel.getModel.findOne();
        if (!existingRecord) {
            const modelObj = {
                lastScrapedDate: new Date(),
                updateFrequency: Number(process.env.UPDATE_FREQUENCY),
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
            updateFrequency: Number(process.env.UPDATE_FREQUENCY),
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
