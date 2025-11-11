import { IFlockCasesByState } from "../../interfaces/i-flock-cases-by-state";
import { logger } from "../../utils/winston-logger";
import pool from "../database-service";

class FlockCasesByStateService {
    /**
     * Uses Find to retrieve all the flock cases from MongoDB
     * @returns All the flock cases for the United States from MongoDB
     */
    public async getAllFlockCases() {
        const result = await pool.query(
            `SELECT state, state_abbreviation, backyard_flocks, commercial_flocks, 
                    birds_affected, total_flocks, latitude, longitude, last_report_date
            FROM flock_cases_by_state
            ORDER BY state_name`
        );
        return result.rows[0];
    }

    /**
     * Uses findOne to retrieve a specific State's flock cases from MongoDB
     * @param requestedState Uses the State's Abbreviation to request a specific State's data (i.e. "WA")
     * @returns The requested State's data
     */
    public async getStateFlockCase(requestedState: String) {
        const result = await pool.query(
            `SELECT state, state_abbreviation, backyard_flocks, commercial_flocks, 
                    birds_affected, total_flocks, latitude, longitude, last_report_date
            FROM flock_cases_by_state
            WHERE state_abbreviation = $1`,
            [requestedState]
        );
        return result.rows[0];
    }

    /**
     * Creates or updates the current US State's data in MongoDB
     * @param flockData This is the array of states, each index is an object containing all the fields in IFlockCasesByState, check this interface for more information
     */
    public async createOrUpdateStateData(flockData: IFlockCasesByState[]) {
        try {            
            const query = `
                INSERT INTO flock_cases_by_state (
                    state, state_abbreviation, backyard_flocks, commercial_flocks, 
                    birds_affected, total_flocks, latitude, longitude, last_report_date
                ) VALUES ${flockData.map((_, i) => 
                    `($${i * 9 + 1}, $${i * 9 + 2}, $${i * 9 + 3}, $${i * 9 + 4}, $${i * 9 + 5}, $${i * 9 + 6}, $${i * 9 + 7}, $${i * 9 + 8}, $${i * 9 + 9})`
                ).join(", ")}
                ON CONFLICT (state_abbreviation) DO UPDATE SET
                    state = EXCLUDED.state,
                    state_abbreviation = EXCLUDED.state_abbreviation,
                    backyard_flocks = EXCLUDED.backyard_flocks,
                    commercial_flocks = EXCLUDED.commercial_flocks,
                    birds_affected = EXCLUDED.birds_affected,
                    total_flocks = EXCLUDED.total_flocks;
                    latitude = EXCLUDED.latitude;
                    longitude = EXCLUDED.longitude;
                    last_report_date = EXCLUDED.last_report_date;
                `;
                const flattened = flockData.flat();
                await pool.query(query, flattened);
        } catch (error) {
            logger.error(
                `Failed to update data for Flock Cases By State: ${error}`
            );
            throw new Error(
                `Failed to update Model information resulted in ${error}`
            );
        }
    }
}
export { FlockCasesByStateService };
