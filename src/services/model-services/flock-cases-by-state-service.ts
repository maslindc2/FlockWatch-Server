import { IFlockCasesByState } from "../../interfaces/i-flock-cases-by-state";
import { FlockCasesByStateModel } from "../../models/flock-cases-by-state-model";
import { logger } from "../../utils/winston-logger";

class FlockCasesByStateService {
    public async getAllFlockCases() {
        return FlockCasesByStateModel.getModel.find({}).select("-_id -__v");
    }
    public async createOrUpdateStateData(flockData: IFlockCasesByState[] ) {
        try {
            for (const currState in flockData){
                await FlockCasesByStateModel.getModel.findOneAndUpdate(
                    {state: flockData[currState].state},
                    flockData[currState],
                    {upsert: true}
                );
            }    
        } catch (error) {
            logger.error(`Failed to update data for Flock Cases By State: ${error}`)
            throw new Error(`Failed to update Model information resulted in ${error}`);
        }
    }
}
export { FlockCasesByStateService };
