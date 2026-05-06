import { FlockCasesByState } from "./flock-cases-by-state.interface";
import { FlockCasesByStateModel } from "./flock-cases-by-state.model";
import { logger } from "../../utils/winston-logger";

// Complete list of valid US state and territory abbreviations
const VALID_STATE_ABBREVIATIONS = new Set([
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "DC", "PR", "GU", "VI", "AS", "MP",
]);

class FlockCasesByStateService {
    public async getAllFlockCases() {
        return await FlockCasesByStateModel.getModel
            .find({})
            .select("-_id -__v")
            .lean();
    }

    public async getStateFlockCase(requestedState: String) {
        return await FlockCasesByStateModel.getModel
            .findOne({ state_abbreviation: requestedState })
            .select("-_id -__v")
            .lean();
    }

    /**
     * Validates a single FlockCasesByState entry before it is written to the DB.
     * Returns false and logs a warning if any field fails validation.
     */
    private isValidFlockEntry(entry: FlockCasesByState): boolean {
        if (
            !entry.state_abbreviation ||
            typeof entry.state_abbreviation !== "string" ||
            !VALID_STATE_ABBREVIATIONS.has(entry.state_abbreviation.toUpperCase())
        ) {
            logger.warn(
                `Rejected flock entry with invalid state_abbreviation: "${entry.state_abbreviation}"`
            );
            return false;
        }

        const numericFields: (keyof FlockCasesByState)[] = [
            "birds_affected",
            "total_flocks",
            "backyard_flocks",
            "commercial_flocks",
            "latitude",
            "longitude",
        ];

        for (const field of numericFields) {
            if (typeof entry[field] !== "number" || !isFinite(entry[field] as number)) {
                logger.warn(
                    `Rejected flock entry for ${entry.state_abbreviation}: invalid value for "${field}"`
                );
                return false;
            }
        }

        return true;
    }

    public async createOrUpdateStateData(flockData: FlockCasesByState[]) {
        try {
            for (const entry of flockData) {
                if (!this.isValidFlockEntry(entry)) {
                    continue;
                }

                // Use state_abbreviation as the unique key -- it is validated
                // against a whitelist above and is never raw user input
                await FlockCasesByStateModel.getModel.findOneAndUpdate(
                    { state_abbreviation: entry.state_abbreviation.toUpperCase() },
                    entry,
                    { upsert: true }
                );
            }
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