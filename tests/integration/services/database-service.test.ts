import dotenv from "dotenv";
import { IUSSummaryStats } from "../../../src/interfaces/i-us-summary-stats";
import { USSummaryService } from "../../../src/services/model-services/us-summary-service";
import { DatabaseService } from "../../../src/services/database-service";
dotenv.config();

describe("DatabaseService Integration", () => {
    it("should connect to mongoDB and allow us to store a USSummaryStats object", async () => {
        await DatabaseService.connect(process.env.MONGODB_URI!);

        // Create a usSummaryService instance
        const usSummaryService = new USSummaryService();
        
        // Create a summary stat object
        const modelObj: IUSSummaryStats = {
            totalBackyardFlocksNationwide: 841,
            totalBirdsAffectedNationwide: 166156928,
            totalCommercialFlocksNationwide: 763,
            totalFlocksAffectedNationwide: 1604,
            totalStatesAffected: 51,
        };
        // Create the summary stats using the object we just made
        await usSummaryService.createOrUpdateUSummaryStats(modelObj);

        // We should get the exact same object from our db but as an array
        const queryFromDB: IUSSummaryStats[] =
            await usSummaryService.getUSSummary();
        
        expect(queryFromDB.length).toEqual(1);
        expect(queryFromDB[0]).toMatchObject(modelObj);
    });
    afterAll(async () => {
        await DatabaseService.disconnect();
    });

});