import { StatusSummary } from "./status-summary.interface";
import { StatusSummaryModel } from "./status-summary.model";
import { logger } from "../../utils/winston-logger";

/**
 * Service for retrieving and upserting the 30-day rolling status summary document.
 */
class StatusSummaryService {
    /**
     * Retrieve the status summary (hides internal Mongoose fields and the key).
     * @returns The status summary data, or null if not found.
     */
    public async getStatusSummary() {
        return StatusSummaryModel.getModel
            .findOne({ key: "status-summary" })
            .select("-_id -__v -key")
            .lean<Omit<StatusSummary, "key"> | null>();
    }

    /**
     * Upsert the status summary document. Creates the document if it does not exist.
     * @param data 30-day status summary data (without the key field).
     */
    public async upsertStatusSummary(data: Omit<StatusSummary, "key">) {
        try {
            const sanitizedEntry = {
                sites_confirmed_last_30_days: data.sites_confirmed_last_30_days,
                sites_released_last_30_days: data.sites_released_last_30_days,
                birds_affected_last_30_days: data.birds_affected_last_30_days,
            };

            await StatusSummaryModel.getModel.findOneAndUpdate(
                { key: "status-summary" },
                { $set: { key: "status-summary", ...sanitizedEntry } },
                { upsert: true }
            );
        } catch (error) {
            logger.error(`Failed to update status summary: ${error}`);
            throw new Error(`Failed to update status summary: ${error}`);
        }
    }
}
export { StatusSummaryService };
