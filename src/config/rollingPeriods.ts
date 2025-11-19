export const RollingPeriods = [
    "last_7_days",
    "last_30_days",
    "last_90_days",
    "year_to_date",
] as const;

export type RollingPeriodName = (typeof RollingPeriods)[number];
