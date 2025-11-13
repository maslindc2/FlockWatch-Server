import pool from "../database-service";
import { logger } from "../../utils/winston-logger";

class LastReportDateService {
    // This will query the last report date model and only return the last scraped date field
    public async getLastScrapedDate() {
        const result = await pool.query(
            `SELECT last_scraped_date
            FROM last_report_date
            `
        );
        return result.rows[0];
    }
    // Only get the authID and hide the id, version, and last scraped date field
    public async getAuthID() {
        const result = await pool.query(
            `SELECT auth_id
            FROM last_report_date`
        );
        return result.rows[0];
    }
    /**
     * On server start this will be executed, if mongoDB is being created for the first time
     * this will create an entry with the date last scraped, scrape frequency, and auth id.
     */
    public async initializeLastReportDate() {
        const auth_id = crypto.randomUUID();
        const last_scraped_date = new Date(0);

        await pool.query(
            `INSERT INTO last_report_date(last_scraped_date, auth_id) 
            VALUES ($1, $2)`,
            [last_scraped_date, auth_id]
        );
    }

    /**
     * Update the last report date table
     * @param isSuccessfulUpdate If this is true we update our auth key and last report date, if not just update the auth key
     */
    public async updateLastReportDate(isSuccessfulUpdate: boolean) {
        const authId = crypto.randomUUID();
        const lastScrapedDate = isSuccessfulUpdate ? new Date() : null;

        try {
            await pool.query(
                `INSERT INTO last_report_date (auth_id, last_scraped_date)
                VALUES ($1, $2)
                ON CONFLICT (auth_id) DO UPDATE SET
                last_scraped_date = EXCLUDED.last_scraped_date`,
                [authId, lastScrapedDate]
            );

            logger.info(
                `Last report date ${
                    isSuccessfulUpdate ? "updated" : "recorded"
                } successfully (auth_id=${authId})`
            );
        } catch (error) {
            logger.error(
                `Failed to update last report date (isSuccessfulUpdate=${isSuccessfulUpdate}): ${error}`
            );
            throw new Error("Failed to update the last report date record");
        }
    }
}
export { LastReportDateService };
