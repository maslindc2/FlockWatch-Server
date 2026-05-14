import { FlockCasesByState } from "./flock-cases-by-state.interface";
import { FlockCasesByStateModel } from "./flock-cases-by-state.model";
import { logger } from "../../utils/winston-logger";

// Complete list of valid US state and territory abbreviations
const VALID_STATE_ABBREVIATIONS = new Set([
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
    "DC",
    "PR",
    "GU",
    "VI",
    "AS",
    "MP",
]);

const VALID_STATE_NAMES = new Set([
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
    "District of Columbia",
    "Puerto Rico",
    "Guam",
    "Virgin Islands",
    "American Samoa",
    "Northern Mariana Islands",
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
            !VALID_STATE_ABBREVIATIONS.has(
                entry.state_abbreviation.toUpperCase()
            )
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
            if (
                typeof entry[field] !== "number" ||
                !isFinite(entry[field] as number)
            ) {
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
            const operations = [];

            for (const entry of flockData) {
                if (!this.isValidFlockEntry(entry)) {
                    continue;
                }
                if (
                    !entry.state ||
                    typeof entry.state !== "string" ||
                    !VALID_STATE_NAMES.has(entry.state)
                ) {
                    logger.error(
                        `Rejected flock entry with invalid state name: "${entry.state}"`
                    );
                    throw new Error(
                        `Failed to update Model information due to state name: ${entry.state}`
                    );
                }

                const sanitizedEntry: FlockCasesByState = {
                    state_abbreviation: entry.state_abbreviation.toUpperCase(),
                    state: entry.state,
                    backyard_flocks: entry.backyard_flocks,
                    commercial_flocks: entry.commercial_flocks,
                    birds_affected: entry.birds_affected,
                    total_flocks: entry.total_flocks,
                    latitude: entry.latitude,
                    longitude: entry.longitude,
                    last_reported_detection: entry.last_reported_detection,
                };

                operations.push({
                    updateOne: {
                        filter: {
                            state_abbreviation:
                                sanitizedEntry.state_abbreviation,
                        },
                        update: { $set: sanitizedEntry },
                        upsert: true,
                    },
                });
            }

            if (operations.length > 0) {
                await FlockCasesByStateModel.getModel.bulkWrite(operations, {
                    ordered: false,
                });
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
