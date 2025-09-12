import { USSummaryService } from "../../../src/services/model-services/us-summary-service";
import { IUSSummaryStats } from "../../../src/interfaces/i-us-summary-stats";
import { USSummaryModel } from "../../../src/models/us-summary-model";
import * as Mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

describe("USSummaryService Integration", () => {
    let usSummaryService: USSummaryService;

    beforeAll(async () => {
        await Mongoose.connect(process.env.MONGODB_URI!);
    }, 10000);

    beforeEach(() => {
        usSummaryService = new USSummaryService();
    });

    it("should insert and retrieve a full US summary correctly", async () => {
        const modelObj: IUSSummaryStats = {
            key: "us-summary",
            allTimeTotals: {
                totalBackyardFlocksAffected: 841,
                totalBirdsAffected: 166156928,
                totalCommercialFlocksAffected: 763,
                totalFlocksAffected: 1604,
                totalStatesAffected: 51,
            },
            periodSummaries: [
                {
                    periodName: "last7Days",
                    totalBackyardFlocksAffected: 10,
                    totalBirdsAffected: 50000,
                    totalCommercialFlocksAffected: 25,
                    totalFlocksAffected: 35,
                },
                {
                    periodName: "last30Days",
                    totalBackyardFlocksAffected: 50,
                    totalBirdsAffected: 1000000,
                    totalCommercialFlocksAffected: 75,
                    totalFlocksAffected: 125,
                },
            ],
        };

        // Use the new bulk upsert method
        await usSummaryService.upsertUSSummary(modelObj);

        const queryFromDB = await usSummaryService.getUSSummary();

        expect(queryFromDB).toMatchObject(modelObj);
    });
    
    it("should update existing period summaries instead of duplicating them", async () => {
        const initialData: IUSSummaryStats = {
            key: "us-summary",
            allTimeTotals: {
                totalBackyardFlocksAffected: 500,
                totalBirdsAffected: 1000000,
                totalCommercialFlocksAffected: 400,
                totalFlocksAffected: 900,
                totalStatesAffected: 50,
            },
            periodSummaries: [
                {
                    periodName: "last30Days",
                    totalBackyardFlocksAffected: 20,
                    totalBirdsAffected: 200000,
                    totalCommercialFlocksAffected: 15,
                    totalFlocksAffected: 35,
                },
            ],
        };

        // First upsert inserts the data
        await usSummaryService.upsertUSSummary(initialData);

        // Second upsert updates the same period with new metrics
        const updatedData: IUSSummaryStats = {
            key: "us-summary",
            allTimeTotals: {
                totalBackyardFlocksAffected: 550, // updated all-time totals
                totalBirdsAffected: 1200000,
                totalCommercialFlocksAffected: 450,
                totalFlocksAffected: 1000,
                totalStatesAffected: 51,
            },
            periodSummaries: [
                {
                    periodName: "last30Days", // same period, should update
                    totalBackyardFlocksAffected: 25,
                    totalBirdsAffected: 250000,
                    totalCommercialFlocksAffected: 20,
                    totalFlocksAffected: 45,
                },
            ],
        };

        await usSummaryService.upsertUSSummary(updatedData);

        const queryFromDB = await usSummaryService.getUSSummary();

        // Check that all-time totals were updated
        expect(queryFromDB!.allTimeTotals).toMatchObject(updatedData.allTimeTotals);

        // Check that period summary was updated, not duplicated
        expect(queryFromDB!.periodSummaries).toHaveLength(1);
        expect(queryFromDB!.periodSummaries[0]).toMatchObject(
            updatedData.periodSummaries[0]
        );
    });


    afterEach(async () => {
        // Clear only the collection to keep things isolated
        await USSummaryModel.getModel.deleteMany({});
    });

    afterAll(async () => {
        await Mongoose.disconnect();
    });
});
