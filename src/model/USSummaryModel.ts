import * as Mongoose from "mongoose";
import { IUSSummaryStats } from "../interfaces/IUSSummaryStats";
import { logger } from "../utils/winstonLogger";

class USSummaryModel{
    public schema: any;
    public model: any;
    public dbConnectionString: string;

    public constructor(DB_CONNECTION_STRING: string) {
        this.dbConnectionString = DB_CONNECTION_STRING;
        this.createSchema();
    }
    
    public createSchema() {
        this.schema = new Mongoose.Schema(
            {
                totalStatesAffected: Number,  // Number of states with infections
                totalBirdsAffectedNationwide: Number,  // Total birds affected nationwide
                totalFlocksAffectedNationwide: Number,  // Total flocks affected nationwide
                totalBackyardFlocksNationwide: Number,  // Backyard flocks affected nationwide
                totalCommercialFlocksNationwide: Number,  // Commercial flocks affected nationwide
            }
        )
        { collection : "us summary stats"}
    }
    public async createModel() {
        try {
            await Mongoose.connect(this.dbConnectionString);
            if (Mongoose.models.USSummary){
                this.model = Mongoose.model<IUSSummaryStats>("USSummary");
            }else{
                this.model = Mongoose.model<IUSSummaryStats>(
                    "USSummary",
                    this.schema
                );
            }
        } catch (error) {
            logger.error(error);
        }
    }
    // Getting and Setting functions to DB goes here
}
export {USSummaryModel};