import { PipelineStage } from "mongoose";
import { SiteDetailsModel } from "../site-details/site-details.model";
import {
    OutbreakTimelineResponse,
    PeriodEntry,
} from "./outbreak-timeline.interface";
import { logger } from "../../utils/winston-logger";

/**
 * Granularity-to-format mapping for MongoDB $dateToString.
 */
const GRANULARITY_FORMATS = {
    week: "%G-W%V",
    month: "%Y-%m",
    year: "%Y",
} as const satisfies Record<string, string>;

type Granularity = keyof typeof GRANULARITY_FORMATS;

/**
 * Service for computing outbreak timeline data grouped into time-bucketed periods.
 * Queries the site-details collection and aggregates by confirmed_diagnosis_date.
 */
class OutbreakTimelineService {
    /**
     * Retrieve outbreak timeline data grouped by the specified granularity.
     * @param granularity Bucket size — "week", "month", or "year".
     * @returns OutbreakTimelineResponse with periods array sorted chronologically.
     * @throws Error if an invalid granularity is provided.
     */
    public async getTimeline(
        granularity: string
    ): Promise<OutbreakTimelineResponse> {
        const format = GRANULARITY_FORMATS[granularity as Granularity];
        if (!format) {
            const valid = Object.keys(GRANULARITY_FORMATS).join(", ");
            throw new Error(
                `Invalid granularity "${granularity}". Valid values: ${valid}`
            );
        }

        const pipeline: PipelineStage[] = [
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format,
                            date: "$confirmed_diagnosis_date",
                        },
                    },
                    new_confirmations: { $sum: 1 },
                    birds_affected: { $sum: "$birds_affected" },
                },
            },
            {
                $project: {
                    _id: 0,
                    period: "$_id",
                    new_confirmations: 1,
                    birds_affected: 1,
                },
            },
            { $sort: { period: 1 as const } },
        ];

        try {
            const results = await SiteDetailsModel.getModel
                .aggregate<Omit<PeriodEntry, "cumulative_birds_affected">>(
                    pipeline
                )
                .exec();

            let cumulative = 0;
            const periods: PeriodEntry[] = results.map((row) => {
                cumulative += row.birds_affected;
                return {
                    period: row.period,
                    new_confirmations: row.new_confirmations,
                    birds_affected: row.birds_affected,
                    cumulative_birds_affected: cumulative,
                };
            });

            return {
                granularity: granularity as Granularity,
                periods,
            };
        } catch (error) {
            logger.error(`Failed to compute outbreak timeline: ${error}`);
            throw new Error(`Failed to compute outbreak timeline: ${error}`);
        }
    }
}

export { OutbreakTimelineService };
