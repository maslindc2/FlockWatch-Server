import { App } from "../../../src/app";
import { FlockCasesByStateService } from "../../../src/services/model-services/flock-cases-by-state-service";
import { IFlockCasesByState } from "../../../src/interfaces/i-flock-cases-by-state";
import dotenv from "dotenv";
import * as Mongoose from "mongoose";
import request from "supertest";
import { FlockCasesByStateModel } from "../../../src/models/flock-cases-by-state-model";
import { logger } from "../../../src/utils/winston-logger";
import { LastReportDateModel } from "../../../src/models/last-report-date-model";
import { IUSSummaryStats } from "../../../src/interfaces/i-us-summary-stats";
import { USSummaryService } from "../../../src/services/model-services/us-summary-service";
import { DatabaseService } from "../../../src/services/database-service";
import { USSummaryModel } from "../../../src/models/us-summary-model";

dotenv.config();

// We will be testing all the GET routes defined in data-routes.ts
describe("Routes integration tests", () => {
    describe("GET root url", () => {
        beforeAll(async () => {
            try {
                // Connect using the MongoDB URI
                await Mongoose.connect(process.env.MONGODB_URI!);
                console.log("MongoDB connected successfully.");
            } catch (error) {
                console.error("Error connecting to MongoDB:", error);
                throw new Error("MongoDB connection failed");
            }
        });
        it("should return root api message, when root url is requested", async () => {
            const res = await request(new App().app)
                .get("/")
                .expect("Content-Type", /json/)
                .expect(200);
            expect(res.body.message).toEqual("Nothing here but us Chickens");
        });
        afterAll(async () => {
            // Disconnect from mongoose
            await DatabaseService.disconnect();
        });
    });
    describe("GET /data/flock-cases", () => {
        // Before we test the flock-cases route we need to connect to MongoDB
        beforeAll(async () => {
            try {
                // Connect using the MongoDB URI
                await Mongoose.connect(process.env.MONGODB_URI!);
                console.log("MongoDB connected successfully.");
                // Define the state data that we will be storing to the database of the expected type
                const flockData: IFlockCasesByState[] = [
                    {
                        stateAbbreviation: "PA",
                        state: "Pennsylvania",
                        backyardFlocks: 2344370,
                        commercialFlocks: 7,
                        birdsAffected: 7,
                        totalFlocks: 390728,
                        latitude: 40.99773861,
                        longitude: -76.19300025,
                        lastReportedDate: new Date(Date.UTC(2025, 2 - 1, 5)),
                    },
                ];

                // Create an instance of our service
                const flockCasesService = new FlockCasesByStateService();
                // Store our state data that we defined
                await flockCasesService.createOrUpdateStateData(flockData);
            } catch (error) {
                console.error("Error connecting to MongoDB:", error);
                throw new Error("MongoDB connection failed");
            }
        });
        it("should return all us flock cases when a GET request is made to /data/flock-cases", async () => {
            // Create a spy for our logger as we are expected to receive http logging information
            const loggerSpy = jest.spyOn(logger, "http");
            // Define the data that we are expecting, one might say I should just reuse the exact same object but do to the
            // typing and the use of new Date(Date.UTC(2025, 2 - 1, 5)) we have to define this as "2025-02-05T00:00:00.000Z".
            const expectedFlockData = [
                {
                    stateAbbreviation: "PA",
                    state: "Pennsylvania",
                    backyardFlocks: 2344370,
                    commercialFlocks: 7,
                    birdsAffected: 7,
                    totalFlocks: 390728,
                    latitude: 40.99773861,
                    longitude: -76.19300025,
                    lastReportedDate: "2025-02-05T00:00:00.000Z",
                },
            ];
            // Make the request using a new instance of app and the route to flock cases it should be of type JSON and have a status of 200
            const res = await request(new App().app)
                .get("/data/flock-cases")
                .expect("Content-Type", /json/)
                .expect(200);
            expect(res.body).toEqual({data: expectedFlockData});
            expect(loggerSpy).toHaveBeenCalledWith(
                "Received Request at Flock Cases By State: /flock-cases"
            );
            loggerSpy.mockClear();
        });
        afterAll(async () => {
            // Drop the database we made for flock cases so we can start new for the next test
            await FlockCasesByStateModel.getModel.db.dropDatabase();
            // Disconnect from mongoose
            await Mongoose.disconnect();
        });
    });
    describe("GET /data/last-scraped-date", () => {
        beforeAll(async () => {
            try {
                // Connect using the MongoDB URI
                await Mongoose.connect(process.env.MONGODB_URI!);

                console.log("MongoDB connected successfully.");
                // Define the last report data model that we will be storing to the database
                const LastReportDateData = {
                    lastScrapedDate: new Date("2025-04-02T12:00:00Z"),
                    authID: "mocked-uuid-for-testing-1234",
                };
                // Store the data to our model
                await LastReportDateModel.getModel.create(LastReportDateData);
            } catch (error) {
                console.error("Error connecting to MongoDB:", error);
                throw new Error("MongoDB connection failed");
            }
        });
        it("should return the last scraped date when a GET request is made to /data/last-scraped-date", async () => {
            // Create a spy for our logger as we are expected to receive http logging information
            const loggerSpy = jest.spyOn(logger, "http");
            // Defining the expected data we should get back, we should only get the last scraped date back as a string
            const expectedLastScrapedDate = {
                lastScrapedDate: "2025-04-02T12:00:00.000Z",
            };
            // Make the request to last-scraped-date
            const res = await request(new App().app)
                .get("/data/last-scraped-date")
                .expect("Content-Type", /json/)
                .expect(200);
            expect(res.body).toEqual({data: expectedLastScrapedDate});
            expect(loggerSpy).toHaveBeenCalledWith(
                "Received Request at Last Report Date /last-scraped-date"
            );
            loggerSpy.mockClear();
        });
        afterAll(async () => {
            // Drop the database we made for last report date so we can start new for the next test
            await LastReportDateModel.getModel.db.dropDatabase();
            // Disconnect from mongoose
            await Mongoose.disconnect();
        });
    });
    describe("GET /data/us-summary", () => {
        let usSummaryData: IUSSummaryStats;
        beforeAll(async () => {
            try {
                // Connect using the MongoDB URI
                await Mongoose.connect(process.env.MONGODB_URI!);

                console.log("MongoDB connected successfully.");
                // Define the us summary model that we will be storing to the database
                usSummaryData = {
                    totalBackyardFlocksNationwide: 841,
                    totalBirdsAffectedNationwide: 166156928,
                    totalCommercialFlocksNationwide: 763,
                    totalFlocksAffectedNationwide: 1604,
                    totalStatesAffected: 51,
                };
                const usSummaryService = new USSummaryService();
                await usSummaryService.createOrUpdateUSummaryStats(
                    usSummaryData
                );
            } catch (error) {
                console.error("Error connecting to MongoDB:", error);
                throw new Error("MongoDB connection failed");
            }
        });
        it("should return the last scraped date when a GET request is made to /data/us-summary", async () => {
            // Create a spy for our logger as we are expected to receive http logging information
            const loggerSpy = jest.spyOn(logger, "http");

            // Make the request to us-summary
            const res = await request(new App().app)
                .get("/data/us-summary")
                .expect("Content-Type", /json/)
                .expect(200);
            // Expect to get the same us summary data back
            expect(res.body).toEqual({data: usSummaryData});
            // Expect our logger to log our http request
            expect(loggerSpy).toHaveBeenCalledWith(
                "Received Request at US Summary /us-summary"
            );
            loggerSpy.mockClear();
        });
        afterAll(async () => {
            // Drop the database we made for us summary data so we can start new for the next test
            await USSummaryModel.getModel.db.dropDatabase();
            // Disconnect from mongoose
            await Mongoose.disconnect();
        });
    });
});
