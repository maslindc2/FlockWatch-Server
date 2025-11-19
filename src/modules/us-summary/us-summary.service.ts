import {
    AllTimeTotals,
    PeriodSummary,
    USSummaryStats,
} from "./us-summary-stats.interface";
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

    public async getFormattedUSSummary() {
        const summary: any = await USSummaryModel.getModel
            .findOne({ key: "us-summary" })
            .select("-_id -__v")
            .lean<USSummaryStats>();

        if (!summary) return null;
        return {
            all_time_totals: summary.allTimeTotals,
            period_summaries: USSummaryModel.formatPeriods(
                summary.period_summaries
            ),
        };
    }

    /**
     * Updates or inserts the all-time totals.
     */
    public async updateAllTimeTotals(allTimeTotals: AllTimeTotals) {
        return USSummaryModel.updateAllTimeTotals(allTimeTotals);
    }

    /**
     * Updates or inserts a rolling period summary.
     */
    public async upsertPeriodSummary(period: PeriodSummary) {
        return USSummaryModel.upsertPeriodAtomic(period);
    }

    /**
     * A helper to bulk-update both all-time totals and periods in one call.
     * Useful for when your scraper finishes a full run.
     */
    public async upsertUSSummary(usSummaryStats: USSummaryStats) {
        const { all_time_totals, period_summaries } = usSummaryStats;

        // Update all-time
        await this.updateAllTimeTotals(all_time_totals);

        // Update each period
        for (const period of period_summaries) {
            
            await this.upsertPeriodSummary(period);
        }

        // Return the unified doc for convenience
        return this.getUSSummary();
    }
}

export { USSummaryService };
