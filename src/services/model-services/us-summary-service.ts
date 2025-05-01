import { IUSSummaryStats } from "../../interfaces/i-us-summary-stats";
import { USSummaryModel } from "../../models/us-summary-model";

class USSummaryService {
    // Gets the US Summary stats which contains: totalStatesAffected, totalBirdsAffectedNationwide, totalFlocksAffectedNationwide, totalBackyardFlocksNationwide, totalCommercialFlocksNationwide
    // Hides the id and version fields
    public async getUSSummary() {
        return USSummaryModel.getModel.find({}).select("-_id -__v");
    }
    // Used to update or create the US Summary Stats, used when we receive data from the scrapers
    public async createOrUpdateUSummaryStats(usSummaryStats: IUSSummaryStats) {
        return await USSummaryModel.getModel.findOneAndUpdate(
            {},
            usSummaryStats,
            { upsert: true }
        );
    }
}
export { USSummaryService };
