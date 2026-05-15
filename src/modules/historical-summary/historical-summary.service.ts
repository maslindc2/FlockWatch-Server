import { HistoricalSummary } from "./historical-summary.interface";
import { HistoricalSummaryModel } from "./historical-summary.model";
import { logger } from "../../utils/winston-logger";

/**
 * Service for retrieving and upserting the all-time historical summary document.
 */
class HistoricalSummaryService {
    /**
     * Retrieve the historical summary (hides internal Mongoose fields and the key).
     * @returns The historical summary data, or null if not found.
     */
    public async getHistoricalSummary() {
        return HistoricalSummaryModel.getModel
            .findOne({ key: "historical-summary" })
            .select("-_id -__v -key")
            .lean<Omit<HistoricalSummary, "key"> | null>();
    }

    /**
     * Upsert the historical summary document. Creates the document if it does not exist.
     * @param data Historical summary data (without the key field).
     */
    public async upsertHistoricalSummary(data: Omit<HistoricalSummary, "key">) {
        try {
            const sanitizedEntry = {
                total_birds_affected_all_time:
                    data.total_birds_affected_all_time,
                total_sites_all_time: data.total_sites_all_time,
                total_active_sites: data.total_active_sites,
                total_released_sites: data.total_released_sites,
                total_na_sites: data.total_na_sites,
                total_birds_active: data.total_birds_active,
            };

            await HistoricalSummaryModel.getModel.findOneAndUpdate(
                { key: "historical-summary" },
                { $set: { key: "historical-summary", ...sanitizedEntry } },
                { upsert: true }
            );
        } catch (error) {
            logger.error(`Failed to update historical summary: ${error}`);
            throw new Error(`Failed to update historical summary: ${error}`);
        }
    }
}
export { HistoricalSummaryService };
