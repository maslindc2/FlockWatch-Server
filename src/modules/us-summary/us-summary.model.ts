import * as Mongoose from "mongoose";
import { RollingPeriods, RollingPeriodName } from "../../config/rollingPeriods";
import {
    AllTimeTotals,
    PeriodSummary,
    USSummaryStats,
} from "./us-summary-stats.interface";

/**
 * USSummary Model this model contains the highlight information about the current status of Avian Flu
 * All entries are created by summing columns in the Map Comparisons.csv file
 * - total_states_affected created by summing the State Name Columns that have detections
 * - total_birds_affected_nationwide created by summing the Birds Affected column
 * - total_flocks_affected_nationwide created by summing the Total Flocks column
 * - total_backyard_flocks_nationwide created by summing the Backyard Flocks column
 * - total_commercial_flocks_nationwide created by summing the Commercial Flocks column
 */
class USSummaryModel {
    private static periodSummarySchema = new Mongoose.Schema<PeriodSummary>(
        {
            period_name: { type: String, required: true },
            total_birds_affected: { type: Number, required: true },
            total_flocks_affected: { type: Number, required: true },
            total_backyard_flocks_affected: { type: Number, required: true },
            total_commercial_flocks_affected: { type: Number, required: true },
        },
        { _id: false }
    );

    private static allTimeTotalsSchema = new Mongoose.Schema<AllTimeTotals>(
        {
            total_states_affected: { type: Number, index: true },
            total_birds_affected: { type: Number, required: true },
            total_flocks_affected: { type: Number, required: true },
            total_backyard_flocks_affected: { type: Number, required: true },
            total_commercial_flocks_affected: { type: Number, required: true },
        },
        { _id: false }
    );

    private static schema = new Mongoose.Schema<USSummaryStats>(
        {
            key: {
                type: String,
                required: true,
                unique: true,
                default: "us-summary",
            },
            all_time_totals: { type: this.allTimeTotalsSchema, required: true },
            period_summaries: { type: [this.periodSummarySchema], default: [] },
        },
        { collection: "us-summary" }
    );

    public static getModel = Mongoose.model<USSummaryStats>(
        "us-summary",
        this.schema
    );

    public static formatPeriods(
        periodArray: PeriodSummary[]
    ): Record<string, Omit<PeriodSummary, "period_name">> {
        return periodArray.reduce(
            (acc, period) => {
                const { period_name, ...metrics } = period;
                acc[period_name] = metrics;
                return acc;
            },
            {} as Record<string, Omit<PeriodSummary, "period_name">>
        );
    }

    public static async updateAllTimeTotals(allTimeTotals: AllTimeTotals) {
        return this.getModel.findOneAndUpdate(
            { key: "us-summary" },
            { $set: { allTimeTotals } },
            { upsert: true, new: true }
        );
    }

    public static async upsertPeriodAtomic(period: PeriodSummary) {
        if (!RollingPeriods.includes(period.period_name as RollingPeriodName)) {
            throw new Error(`Invalid period_name: ${period.period_name}`);
        }
        
        return this.getModel
            .findOneAndUpdate(
                {
                    key: "us-summary",
                    "period_summaries.period_name": period.period_name,
                },
                { $set: { "period_summaries.$": period } }, // update existing period
                { upsert: false, new: true }
            )
            .then(async (doc) => {
                // If no existing period found, push it
                if (!doc) {
                    return this.getModel.findOneAndUpdate(
                        { key: "us-summary" },
                        { $push: { period_summaries: period } },
                        { upsert: true, new: true }
                    );
                }
                return doc;
            });
    }
}

export { USSummaryModel };
