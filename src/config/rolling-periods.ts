/**
 * The set of rolling period names used for US summary period statistics.
 * Each entry represents a predefined time window for aggregating avian influenza data.
 */
export const RollingPeriods = [
    "last_7_days",
    "last_30_days",
    "last_90_days",
    "year_to_date",
] as const;

/**
 * Union type of valid rolling period names derived from the RollingPeriods array.
 */
export type RollingPeriodName = (typeof RollingPeriods)[number];
