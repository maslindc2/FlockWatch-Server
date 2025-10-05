export const RollingPeriods = [
    "last7Days",
    "last30Days",
    "last90Days",
    "yearToDate",
] as const;

export type RollingPeriodName = (typeof RollingPeriods)[number];
