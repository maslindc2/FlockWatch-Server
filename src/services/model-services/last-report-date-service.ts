import { LastReportDateModel } from "../../models/last-report-date-model";
import { logger } from "../../utils/winston-logger";

class LastReportDateService {
    public async getLastReportDate() {
        return LastReportDateModel.getModel.find({}).select("-_id -__v");
    }
    
    /**
     * On server start this will be executed, if the mongoDB is being created for the first time
     * This will create an entry with the date last scraped, scrape frequency, and auth id.
     */
    public async initializeLastReportDate() {
        const existingRecord = await LastReportDateModel.getModel.findOne();
        if(!existingRecord) {
            const modelObj = {
                lastScrapedDate: new Date(),
                updateFrequency: Number(process.env.UPDATE_FREQUENCY),
                authID: crypto.randomUUID()
            }
            return await LastReportDateModel.getModel.create(modelObj);
        }
    }
    public async createOrUpdateLastReportDate() {
        const modelObj = {
            lastScrapedDate: new Date(),
            updateFrequency: Number(process.env.UPDATE_FREQUENCY),
            authID: crypto.randomUUID()
        }
        return await LastReportDateModel.getModel.findOneAndUpdate(
            {},
            modelObj,
            { upsert: true}
        );
    }
}
export { LastReportDateService };
