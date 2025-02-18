import { USSummaryModel } from "../../models/us-summary-model";

class USSummaryService {
    public async getUSSummary() {
        return USSummaryModel.getModel.find({}).select("-_id -__v");
    }
}
export { USSummaryService };
