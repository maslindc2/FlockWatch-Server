/**
 * 30-day rolling status summary for avian influenza sites.
 */
interface StatusSummary {
    key: string;
    sites_confirmed_last_30_days: number;
    sites_released_last_30_days: number;
    birds_affected_last_30_days: number;
}
export type { StatusSummary };
