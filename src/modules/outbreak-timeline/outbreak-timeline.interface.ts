/**
 * A single time-bucketed period in the outbreak timeline.
 */
interface PeriodEntry {
    /** Bucket label, e.g. "2024-11" (month), "2024-W47" (week), "2024" (year). */
    period: string;
    /** Number of newly confirmed sites in this period. */
    new_confirmations: number;
    /** Total birds affected from sites confirmed in this period. */
    birds_affected: number;
    /** Running total of birds_affected across all periods up to and including this one. */
    cumulative_birds_affected: number;
}

/**
 * Response shape for the outbreak timeline endpoint.
 * The `metadata` field is appended automatically by the attachMetadata middleware.
 */
interface OutbreakTimelineResponse {
    granularity: "week" | "month" | "year";
    periods: PeriodEntry[];
}

export type { PeriodEntry, OutbreakTimelineResponse };
