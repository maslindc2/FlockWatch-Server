/**
 * Cumulative all-time totals for avian influenza across the United States.
 */
interface AllTimeTotals {
    /** Number of states with detected infections. */
    total_states_affected: number;
    /** Total number of birds affected nationwide. */
    total_birds_affected: number;
    /** Total number of flocks affected nationwide. */
    total_flocks_affected: number;
    /** Total number of backyard flocks affected nationwide. */
    total_backyard_flocks_affected: number;
    /** Total number of commercial flocks affected nationwide. */
    total_commercial_flocks_affected: number;
}

/**
 * Summary statistics for a specific rolling time period.
 */
interface PeriodSummary {
    /** Name of the rolling period (e.g. "last_30_days"). */
    period_name: string;
    /** Total birds affected during this period. */
    total_birds_affected: number;
    /** Total flocks affected during this period. */
    total_flocks_affected: number;
    /** Total backyard flocks affected during this period. */
    total_backyard_flocks_affected: number;
    /** Total commercial flocks affected during this period. */
    total_commercial_flocks_affected: number;
}

/**
 * The US Summary document stored in MongoDB.
 * Contains both all-time totals and per-period summaries.
 */
interface USSummaryStats {
    key: string;
    all_time_totals: AllTimeTotals;
    period_summaries: PeriodSummary[];
}

export type { AllTimeTotals, PeriodSummary, USSummaryStats };
