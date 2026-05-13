import { StatusSummary } from "./status-summary.interface";
import { StatusSummaryModel } from "./status-summary.model";
import { logger } from "../../utils/winston-logger";

class StatusSummaryService {
    public async getStatusSummary() {
        return StatusSummaryModel.getModel
            .findOne({ key: "status-summary" })
            .select("-_id -__v -key")
            .lean<Omit<StatusSummary, "key"> | null>();
    }

    public async upsertStatusSummary(
        data: Omit<StatusSummary, "key">
    ) {
        try {
            const sanitizedEntry = {
                sites_confirmed_last_30_days:
                    data.sites_confirmed_last_30_days,
                sites_released_last_30_days: data.sites_released_last_30_days,
                birds_affected_last_30_days: data.birds_affected_last_30_days,
            };

            await StatusSummaryModel.getModel.findOneAndUpdate(
                { key: "status-summary" },
                { $set: { key: "status-summary", ...sanitizedEntry } },
                { upsert: true }
            );
        } catch (error) {
            logger.error(
                `Failed to update status summary: ${error}`
            );
            throw new Error(
                `Failed to update status summary: ${error}`
            );
        }
    }
}
export { StatusSummaryService };
