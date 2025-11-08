import * as Mongoose from "mongoose";
import { RollingPeriods, RollingPeriodName } from "../config/rollingPeriods";
import {
    IAllTimeTotals,
    IPeriodSummary,
    IUSSummaryStats,
} from "../interfaces/i-us-summary-stats";

/**
 * USSummary Model this model contains the highlight information about the current status of Avian Flu
 * All entries are created by summing columns in the Map Comparisons.csv file
 * - totalStatesAffected created by summing the State Name Columns that have detections
 * - totalBirdsAffectedNationwide created by summing the Birds Affected column
 * - totalFlocksAffectedNationwide created by summing the Total Flocks column
 * - totalBackyardFlocksNationwide created by summing the Backyard Flocks column
 * - totalCommercialFlocksNationwide created by summing the Commercial Flocks column
 */
class USSummaryModel {
    private static periodSummarySchema = new Mongoose.Schema<IPeriodSummary>(
        {
            periodName: { type: String, required: true },
            totalBirdsAffected: { type: Number, required: true },
            totalFlocksAffected: { type: Number, required: true },
            totalBackyardFlocksAffected: { type: Number, required: true },
            totalCommercialFlocksAffected: { type: Number, required: true },
        },
        { _id: false }
    );

    private static allTimeTotalsSchema = new Mongoose.Schema<IAllTimeTotals>(
        {
            totalStatesAffected: { type: Number, index: true },
            totalBirdsAffected: { type: Number, required: true },
            totalFlocksAffected: { type: Number, required: true },
            totalBackyardFlocksAffected: { type: Number, required: true },
            totalCommercialFlocksAffected: { type: Number, required: true },
        },
        { _id: false }
    );

    private static schema = new Mongoose.Schema<IUSSummaryStats>(
        {
            key: {
                type: String,
                required: true,
                unique: true,
                default: "us-summary",
            },
            allTimeTotals: { type: this.allTimeTotalsSchema, required: true },
            periodSummaries: { type: [this.periodSummarySchema], default: [] },
        },
        { collection: "us-summary" }
    );

    public static getModel = Mongoose.model<IUSSummaryStats>(
        "us-summary",
        this.schema
    );

    public static formatPeriods(
        periodArray: IPeriodSummary[]
    ): Record<string, Omit<IPeriodSummary, "periodName">> {
        return periodArray.reduce(
            (acc, period) => {
                const { periodName, ...metrics } = period;
                acc[periodName] = metrics;
                return acc;
            },
            {} as Record<string, Omit<IPeriodSummary, "periodName">>
        );
    }

    public static async updateAllTimeTotals(allTimeTotals: IAllTimeTotals) {
        return this.getModel.findOneAndUpdate(
            { key: "us-summary" },
            { $set: { allTimeTotals } },
            { upsert: true, new: true }
        );
    }

    public static async upsertPeriodAtomic(period: IPeriodSummary) {
        if (!RollingPeriods.includes(period.periodName as RollingPeriodName)) {
            throw new Error(`Invalid periodName: ${period.periodName}`);
        }

        return this.getModel
            .findOneAndUpdate(
                {
                    key: "us-summary",
                    "periodSummaries.periodName": period.periodName,
                },
                { $set: { "periodSummaries.$": period } }, // update existing period
                { upsert: false, new: true }
            )
            .then(async (doc) => {
                // If no existing period found, push it
                if (!doc) {
                    return this.getModel.findOneAndUpdate(
                        { key: "us-summary" },
                        { $push: { periodSummaries: period } },
                        { upsert: true, new: true }
                    );
                }
                return doc;
            });
    }
}

export { USSummaryModel };
