import { USSummaryStats } from "./us-summary-stats.interface";
import { USSummaryModel } from "./us-summary.model";

class USSummaryService {
    /**
     * Gets the complete US Summary (all-time totals + rolling periods).
     * Hides the Mongo id and version fields.
     */
    public async getUSSummary() {
        return USSummaryModel.getModel
            .findOne({ key: "us-summary" })
            .select("-_id -__v")
            .lean<USSummaryStats>();
    }

    /**
     * Retrieve and format the US summary with period summaries converted
     * to a record keyed by period_name for easier client-side consumption.
     * @returns An object with all_time_totals and period_summaries, or null.
     */
    public async getFormattedUSSummary() {
        const summary: any = await USSummaryModel.getModel
            .findOne({ key: "us-summary" })
            .select("-_id -__v")
            .lean<USSummaryStats>();

        if (!summary) return null;
        return {
            all_time_totals: summary.all_time_totals,
            period_summaries: USSummaryModel.formatPeriods(
                summary.period_summaries
            ),
        };
    }

    /**
     * Upserts the entire US Summary document in a single atomic operation.
     * Sets both all_time_totals and period_summaries together.
     */
    public async upsertUSSummary(usSummaryStats: USSummaryStats) {
        const { all_time_totals, period_summaries } = usSummaryStats;

        await USSummaryModel.getModel.findOneAndUpdate(
            { key: "us-summary" },
            { $set: { all_time_totals, period_summaries } },
            { upsert: true }
        );

        return this.getUSSummary();
    }
}

export { USSummaryService };
