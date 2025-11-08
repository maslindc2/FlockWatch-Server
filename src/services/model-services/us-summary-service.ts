import {
    IAllTimeTotals,
    IPeriodSummary,
    IUSSummaryStats,
} from "../../interfaces/i-us-summary-stats";
import { USSummaryModel } from "../../models/us-summary-model";
import { logger } from "../../utils/winston-logger";

class USSummaryService {
    /**
     * Gets the complete US Summary (all-time totals + rolling periods).
     * Hides the Mongo id and version fields.
     */
    public async getUSSummary() {
        return USSummaryModel.getModel
            .findOne({ key: "us-summary" })
            .select("-_id -__v")
            .lean<IUSSummaryStats>();
    }

    public async getFormattedUSSummary() {
        const summary: any = await USSummaryModel.getModel
            .findOne({ key: "us-summary" })
            .select("-_id -__v")
            .lean<IUSSummaryStats>();

        if (!summary) return null;
        return {
            allTimeTotals: summary.allTimeTotals,
            periodSummaries: USSummaryModel.formatPeriods(
                summary.periodSummaries
            ),
        };
    }

    /**
     * Updates or inserts the all-time totals.
     */
    public async updateAllTimeTotals(allTimeTotals: IAllTimeTotals) {
        return USSummaryModel.updateAllTimeTotals(allTimeTotals);
    }

    /**
     * Updates or inserts a rolling period summary.
     */
    public async upsertPeriodSummary(period: IPeriodSummary) {
        return USSummaryModel.upsertPeriodAtomic(period);
    }

    /**
     * A helper to bulk-update both all-time totals and periods in one call.
     * Useful for when your scraper finishes a full run.
     */
    public async upsertUSSummary(usSummaryStats: IUSSummaryStats) {
        const { allTimeTotals, periodSummaries } = usSummaryStats;

        // Update all-time
        await this.updateAllTimeTotals(allTimeTotals);

        // Update each period
        for (const period of periodSummaries) {
            await this.upsertPeriodSummary(period);
        }

        // Return the unified doc for convenience
        return this.getUSSummary();
    }
}

export { USSummaryService };
