import { IFlockCasesByState } from "../../interfaces/i-flock-cases-by-state";
import { FlockCasesByStateModel } from "../../models/flock-cases-by-state-model";
import { logger } from "../../utils/winston-logger";

class FlockCasesByStateService {
    // Returns all flock cases from our model
    public async getAllFlockCases() {
        return FlockCasesByStateModel.getModel.find({}).select("-_id -__v");
    }

    /**
     * Creates or updates the current US State's data in MongoDB
     * @param flockData This is the array of states, each index is an object containing all the fields in IFlockCasesByState, check this interface for more information
     */
    public async createOrUpdateStateData(flockData: IFlockCasesByState[]) {
        try {
            for (const currState in flockData) {
                await FlockCasesByStateModel.getModel.findOneAndUpdate(
                    // Find a record matching the current state name
                    { state: flockData[currState].state },
                    // Store the object we got from our scraping service
                    flockData[currState],
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
