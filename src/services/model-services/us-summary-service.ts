import pool from "../database-service";
import { logger } from "../../utils/winston-logger";
import {
    IAllTimeTotals,
    IPeriodSummary,
    IUSSummaryStats,
} from "../../interfaces/i-us-summary-stats";

export class USSummaryService {

    /**
     * Retrieves the full US summary, including all-time totals and rolling periods.
     */
    public async getUSSummary(): Promise<IUSSummaryStats | null> {
        const allTimeRes = await pool.query(
            `SELECT total_states_affected, total_birds_affected, total_flocks_affected,
              total_backyard_flocks_affected, total_commercial_flocks_affected
       FROM us_summary_all_time_totals
       WHERE us_summary_key = 'us-summary'
       LIMIT 1`
        );

        const periodsRes = await pool.query(
            `SELECT period_name, total_birds_affected, total_flocks_affected,
              total_backyard_flocks_affected, total_commercial_flocks_affected
       FROM us_summary_period_summaries
       WHERE us_summary_key = 'us-summary'`
        );

        if (allTimeRes.rowCount === 0 && periodsRes.rowCount === 0) return null;

        return {
            key: "us-summary",
            allTimeTotals: allTimeRes.rows[0],
            periodSummaries: periodsRes.rows,
        };
    }

    /**
     * Formats the US summary into a keyed object (like your old Mongo formatter).
     */
    public async getFormattedUSSummary() {
        const summary = await this.getUSSummary();
        if (!summary) return null;

        const formattedPeriods = summary.periodSummaries.reduce(
            (acc, p) => {
                const { periodName, ...metrics } = p;
                acc[periodName] = metrics;
                return acc;
            },
            {} as Record<string, Omit<IPeriodSummary, "periodName">>
        );

        return {
            allTimeTotals: summary.allTimeTotals,
            periodSummaries: formattedPeriods,
        };
    }

    /**
     * Upserts the all-time totals.
     */
    public async updateAllTimeTotals(allTimeTotals: IAllTimeTotals) {
        const {
            totalStatesAffected,
            totalBirdsAffected,
            totalFlocksAffected,
            totalBackyardFlocksAffected,
            totalCommercialFlocksAffected,
        } = allTimeTotals;

        await pool.query(
            `INSERT INTO us_summary_all_time_totals (
          total_states_affected, total_birds_affected, total_flocks_affected,
          total_backyard_flocks_affected, total_commercial_flocks_affected, us_summary_key
       ) VALUES ($1, $2, $3, $4, $5, 'us-summary')
       ON CONFLICT (us_summary_key) DO UPDATE SET
          total_states_affected = EXCLUDED.total_states_affected,
          total_birds_affected = EXCLUDED.total_birds_affected,
          total_flocks_affected = EXCLUDED.total_flocks_affected,
          total_backyard_flocks_affected = EXCLUDED.total_backyard_flocks_affected,
          total_commercial_flocks_affected = EXCLUDED.total_commercial_flocks_affected`,
            [
                totalStatesAffected,
                totalBirdsAffected,
                totalFlocksAffected,
                totalBackyardFlocksAffected,
                totalCommercialFlocksAffected,
            ]
        );
    }

    /**
     * Upserts a single rolling period summary.
     */
    public async upsertPeriodSummary(period: IPeriodSummary) {
        const {
            periodName,
            totalBirdsAffected,
            totalFlocksAffected,
            totalBackyardFlocksAffected,
            totalCommercialFlocksAffected,
        } = period;

        await pool.query(
            `INSERT INTO us_summary_period_summaries (
          period_name, total_birds_affected, total_flocks_affected,
          total_backyard_flocks_affected, total_commercial_flocks_affected, us_summary_key
       ) VALUES ($1, $2, $3, $4, $5, 'us-summary')
       ON CONFLICT (period_name, us_summary_key) DO UPDATE SET
          total_birds_affected = EXCLUDED.total_birds_affected,
          total_flocks_affected = EXCLUDED.total_flocks_affected,
          total_backyard_flocks_affected = EXCLUDED.total_backyard_flocks_affected,
          total_commercial_flocks_affected = EXCLUDED.total_commercial_flocks_affected`,
            [
                periodName,
                totalBirdsAffected,
                totalFlocksAffected,
                totalBackyardFlocksAffected,
                totalCommercialFlocksAffected,
            ]
        );
    }

    /**
     * Bulk-upserts both all-time totals and period summaries.
     */
    public async upsertUSSummary(usSummaryStats: IUSSummaryStats) {
        const { allTimeTotals, periodSummaries } = usSummaryStats;

        try {
            await pool.query("BEGIN");

            await this.updateAllTimeTotals(allTimeTotals);

            for (const period of periodSummaries) {
                await this.upsertPeriodSummary(period);
            }

            await pool.query("COMMIT");
            return this.getUSSummary();
        } catch (error) {
            await pool.query("ROLLBACK");
            logger.error("Failed to upsert US summary:", error);
            throw new Error("Failed to upsert US summary");
        }
    }
}
