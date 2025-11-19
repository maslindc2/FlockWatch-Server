import * as Mongoose from "mongoose";
import dotenv from "dotenv";
import { USSummaryService } from "../../../src/modules/us-summary/us-summary.service";
import { USSummaryModel } from "../../../src/modules/us-summary/us-summary.model";
import { USSummaryStats } from "../../../src/modules/us-summary/us-summary-stats.interface";
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
        const modelObj: USSummaryStats = {
            key: "us-summary",
            all_time_totals: {
                total_backyard_flocks_affected: 841,
                total_birds_affected: 166156928,
                total_commercial_flocks_affected: 763,
                total_flocks_affected: 1604,
                total_states_affected: 51,
            },
            period_summaries: [
                {
                    period_name: "last_7_days",
                    total_backyard_flocks_affected: 10,
                    total_birds_affected: 50000,
                    total_commercial_flocks_affected: 25,
                    total_flocks_affected: 35,
                },
                {
                    period_name: "last_30_days",
                    total_backyard_flocks_affected: 50,
                    total_birds_affected: 1000000,
                    total_commercial_flocks_affected: 75,
                    total_flocks_affected: 125,
                },
            ],
        };

        // Use the new bulk upsert method
        await usSummaryService.upsertUSSummary(modelObj);

        const queryFromDB = await usSummaryService.getUSSummary();

        expect(queryFromDB).toMatchObject(modelObj);
    });

    it("should update existing period summaries instead of duplicating them", async () => {
        const initialData: USSummaryStats = {
            key: "us-summary",
            all_time_totals: {
                total_backyard_flocks_affected: 500,
                total_birds_affected: 1000000,
                total_commercial_flocks_affected: 400,
                total_flocks_affected: 900,
                total_states_affected: 50,
            },
            period_summaries: [
                {
                    period_name: "last_30_days",
                    total_backyard_flocks_affected: 20,
                    total_birds_affected: 200000,
                    total_commercial_flocks_affected: 15,
                    total_flocks_affected: 35,
                },
            ],
        };

        // First upsert inserts the data
        await usSummaryService.upsertUSSummary(initialData);

        // Second upsert updates the same period with new metrics
        const updatedData: USSummaryStats = {
            key: "us-summary",
            all_time_totals: {
                total_backyard_flocks_affected: 550, // updated all-time totals
                total_birds_affected: 1200000,
                total_commercial_flocks_affected: 450,
                total_flocks_affected: 1000,
                total_states_affected: 51,
            },
            period_summaries: [
                {
                    period_name: "last_30_days", // same period, should update
                    total_backyard_flocks_affected: 25,
                    total_birds_affected: 250000,
                    total_commercial_flocks_affected: 20,
                    total_flocks_affected: 45,
                },
            ],
        };

        await usSummaryService.upsertUSSummary(updatedData);

        const queryFromDB = await usSummaryService.getUSSummary();

        // Check that all-time totals were updated
        expect(queryFromDB!.all_time_totals).toMatchObject(
            updatedData.all_time_totals
        );

        // Check that period summary was updated, not duplicated
        expect(queryFromDB!.period_summaries).toHaveLength(1);
        expect(queryFromDB!.period_summaries[0]).toMatchObject(
            updatedData.period_summaries[0]
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
