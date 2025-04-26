import { LastReportDateService } from "../../../src/services/model-services/last-report-date-service";
import { ILastReportDate } from "../../../src/interfaces/models/i-last-report-date";
import { LastReportDateModel } from "../../../src/models/last-report-date-model";
import * as Mongoose from "mongoose";

import dotenv from "dotenv";

dotenv.config();

describe("LastReportDateService Integration", () => {
    let lastReportDateService: LastReportDateService;
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
        jest.resetModules();
        lastReportDateService = new LastReportDateService();
    });

    it("should initialize the database with a new data entry", async () => {
        const expectedModelObj = {
            lastScrapedDate: expect.any(Date),
            authID: expect.any(String),
        };

        // Initialize the database like it would on startup
        const createdRecord =
            await lastReportDateService.initializeLastReportDate();

        // Now our state data from our DB should equal our flockData that we made earlier
        expect(createdRecord).toMatchObject(expectedModelObj);
    });

    it("should return the existing record in the database if initialize was called twice", async () => {
        const modelSpy = jest.spyOn(LastReportDateModel.getModel, "findOne");

        // Initialize the database with our first call
        const initialRecord =
            await lastReportDateService.initializeLastReportDate();

        // Should get back the exact same record from our database since its been initialized already
        const existingRecord =
            await lastReportDateService.initializeLastReportDate();
        // Since we use Mongoose we need to strip the proxied object portion from our result
        // This is done by Stringify and then parsing.
        const stripProxiedObject = (obj: ILastReportDate) =>
            JSON.parse(JSON.stringify(obj));

        // findOne should be called twice as we are in fact calling it twice
        expect(modelSpy).toHaveBeenCalledTimes(2);
        // We should get back the exact same record that we initialized the database with
        expect(stripProxiedObject(initialRecord)).toMatchObject(
            stripProxiedObject(existingRecord)
        );
    });

    afterEach(async () => {
        // Drop the database so it's ready for our next test
        await LastReportDateModel.getModel.db.dropDatabase();
    });
    afterAll(async () => {
        // Disconnect from mongo after all our tests
        await Mongoose.disconnect();
    });
});
