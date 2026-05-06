import { FlockCasesByState } from "./flock-cases-by-state.interface";
import { FlockCasesByStateModel } from "./flock-cases-by-state.model";
import { logger } from "../../utils/winston-logger";

class FlockCasesByStateService {
    /**
     * Uses Find to retrieve all the flock cases from MongoDB
     * @returns All the flock cases for the United States from MongoDB
     */
    public async getAllFlockCases() {
        return await FlockCasesByStateModel.getModel
            .find({})
            .select("-_id -__v")
            .lean();
    }

    /**
     * Uses findOne to retrieve a specific State's flock cases from MongoDB
     * @param requestedState Uses the State's Abbreviation to request a specific State's data (i.e. "WA")
     * @returns The requested State's data
     */
    public async getStateFlockCase(requestedState: String) {
        return await FlockCasesByStateModel.getModel
            .findOne({ state_abbreviation: requestedState })
            .select("-_id -__v")
            .lean();
    }

    /**
     * Creates or updates the current US State's data in MongoDB
     * @param flockData This is the array of states, each index is an object containing all the fields in IFlockCasesByState, check this interface for more information
     */
    public async createOrUpdateStateData(flockData: FlockCasesByState[]) {
        try {
            for (const currState in flockData) {
                const stateData = flockData[currState];
                // Validate state_abbreviation is a valid 2-letter code to prevent injection
                if (!/^[A-Z]{2}$/.test(stateData.state_abbreviation)) {
                    logger.warn(
                        `Invalid state_abbreviation: ${stateData.state_abbreviation}`
                    );
                    continue;
                }
                await FlockCasesByStateModel.getModel.findOneAndUpdate(
                    // Find a record matching the state abbreviation (controlled field)
                    { state_abbreviation: stateData.state_abbreviation },
                    // Store the object we got from our scraping service
                    stateData,
                    // Create it if it's not there already
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
