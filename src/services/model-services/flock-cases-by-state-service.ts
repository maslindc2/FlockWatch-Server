import { FlockCasesByStateModel } from "../../models/flock-cases-by-state-model";
class FlockCasesByStateService {
    public async getAllFlockCases() {
        return FlockCasesByStateModel.getModel.find({}).select("-_id -__v");
    }
}
export { FlockCasesByStateService };
