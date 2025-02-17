import * as Mongoose from "mongoose";
import { IUSSummaryStats } from "../interfaces/IUSSummaryStats";

class USSummaryModel {
    private static schema = new Mongoose.Schema<IUSSummaryStats>({
        totalStatesAffected: Number,
        totalBirdsAffectedNationwide: Number,
        totalFlocksAffectedNationwide: Number,
        totalBackyardFlocksNationwide: Number,
        totalCommercialFlocksNationwide: Number,
    });

    public static model = Mongoose.model<IUSSummaryStats>(
        "USSummary",
        this.schema
    );
    
}

export { USSummaryModel };
