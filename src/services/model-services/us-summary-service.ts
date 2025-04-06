import { IUSSummaryStats } from "../../interfaces/i-us-summary-stats";
import { USSummaryModel } from "../../models/us-summary-model";

class USSummaryService {
    public async getUSSummary() {
        return USSummaryModel.getModel.find({}).select("-_id -__v");
    }
    public async createOrUpdateUSummaryStats(usSummaryStats: IUSSummaryStats) {
        return await USSummaryModel.getModel.findOneAndUpdate({}, usSummaryStats, {upsert: true});
    }
}
export { USSummaryService };
