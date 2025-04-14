import { USSummaryService } from "../../../src/services/model-services/us-summary-service";
import { IUSSummaryStats } from "../../../src/interfaces/i-us-summary-stats";
import { USSummaryModel } from "../../../src/models/us-summary-model";
import * as Mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

describe("USSummaryService Integration", () => {
    let usSummaryService: USSummaryService;
    beforeAll(async () => {
        try {
            await Mongoose.connect(process.env.MONGODB_URI!);
            console.log("MongoDB connected successfully.");
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw new Error("MongoDB connection failed");
        }
    }, 10000);

    beforeEach(() => {
        usSummaryService = new USSummaryService();
    });

    it("should create store us summary stats", async () => {
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
        // Now our state data from our DB should equal our flockData that we made earlier
        expect(queryFromDB[0]).toMatchObject(modelObj);
    });

    afterEach(async () => {
        // Drop the database so it's ready for our next test
        await USSummaryModel.getModel.db.dropDatabase();
    });
    afterAll(async () => {
        // Disconnect from mongo after all our tests
        await Mongoose.disconnect();
    });
});
