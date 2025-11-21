import { App } from "../../../src/app";
import { FlockCasesByState } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.interface";
import dotenv from "dotenv";
import * as Mongoose from "mongoose";
import request from "supertest";
import { logger } from "../../../src/utils/winston-logger";
import { USSummaryStats } from "../../../src/modules/us-summary/us-summary-stats.interface";
import { FlockCasesByStateService } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.service";
import { FlockCasesByStateModel } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.model";
import { USSummaryService } from "../../../src/modules/us-summary/us-summary.service";
import { USSummaryModel } from "../../../src/modules/us-summary/us-summary.model";
import { DatabaseService } from "../../../src/services/database.service";

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
                const flockData: FlockCasesByState[] = [
                    {
                        state_abbreviation: "PA",
                        state: "Pennsylvania",
                        backyard_flocks: 2344370,
                        commercial_flocks: 7,
                        birds_affected: 7,
                        total_flocks: 390728,
                        latitude: 40.99773861,
                        longitude: -76.19300025,
                        last_reported_detection: new Date(
                            Date.UTC(2025, 2 - 1, 5)
                        ),
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
                    state_abbreviation: "PA",
                    state: "Pennsylvania",
                    backyard_flocks: 2344370,
                    commercial_flocks: 7,
                    birds_affected: 7,
                    total_flocks: 390728,
                    latitude: 40.99773861,
                    longitude: -76.19300025,
                    last_reported_detection: "2025-02-05T00:00:00.000Z",
                },
            ];
            // Make the request using a new instance of app and the route to flock cases it should be of type JSON and have a status of 200
            const res = await request(new App().app)
                .get("/data/flock-cases")
                .expect("Content-Type", /json/)
                .expect(200);
            expect(res.body.data).toEqual(expectedFlockData);
            expect(loggerSpy).toHaveBeenCalledWith(
                "Received Request at Get All Flock Cases By State: /flock-cases"
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

    describe("GET /data/flock-cases/:stateAbbreviation", () => {
        // Before we test the state abbreviation route we need to connect and load the test information
        beforeAll(async () => {
            try {
                // Connect using the MongoDB URI
                await Mongoose.connect(process.env.MONGODB_URI!);
                console.log("MongoDB connected successfully.");
                // Define the state data that we will be storing to the database of the expected type
                const flockData: FlockCasesByState[] = [
                    {
                        state_abbreviation: "WA",
                        state: "Washington",
                        backyard_flocks: 52,
                        commercial_flocks: 3,
                        birds_affected: 2167079,
                        total_flocks: 55,
                        latitude: 47.556837171,
                        longitude: -122.16233971,
                        last_reported_detection: new Date(
                            Date.UTC(2025, 2 - 1, 5)
                        ),
                    },
                    {
                        state_abbreviation: "PA",
                        state: "Pennsylvania",
                        backyard_flocks: 2344370,
                        commercial_flocks: 7,
                        birds_affected: 7,
                        total_flocks: 390728,
                        latitude: 40.99773861,
                        longitude: -76.19300025,
                        last_reported_detection: new Date(
                            Date.UTC(2025, 2 - 1, 5)
                        ),
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

        it("should return the flock cases for Washington State when a get request has been made to /flock-cases/WA", async () => {
            // Create a spy for our logger as we are expected to receive http logging information
            const loggerSpy = jest.spyOn(logger, "http");
            // Define the object we should get as a response.  Remember this route only returns an object not an array
            const expectedFlockData = {
                state_abbreviation: "WA",
                state: "Washington",
                backyard_flocks: 52,
                commercial_flocks: 3,
                birds_affected: 2167079,
                total_flocks: 55,
                latitude: 47.556837171,
                longitude: -122.16233971,
                last_reported_detection: "2025-02-05T00:00:00.000Z",
            };
            // Make the request using a new instance of app and the route to flock cases it should be of type JSON and have a status of 200
            const res = await request(new App().app)
                .get("/data/flock-cases/WA")
                .expect("Content-Type", /json/)
                .expect(200);
            expect(res.body.data).toEqual(expectedFlockData);
            expect(loggerSpy).toHaveBeenCalledWith(
                "Received Request at Get a State's Flock Case: /flock-cases/WA"
            );
            loggerSpy.mockClear();
        });
        afterAll(async () => {
            await FlockCasesByStateModel.getModel.db.dropDatabase();
            await Mongoose.disconnect();
        });
    });

    describe("GET /data/us-summary", () => {
        let usSummaryData: USSummaryStats;
        let usSummaryService: USSummaryService;

        beforeAll(async () => {
            await Mongoose.connect(process.env.MONGODB_URI!);
            usSummaryService = new USSummaryService();

            // Define the us summary model in the new schema
            usSummaryData = {
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

            // Store the data using the new upsert method
            await usSummaryService.upsertUSSummary(usSummaryData);
        });

        it("should return all-time totals and period summaries correctly", async () => {
            const loggerSpy = jest.spyOn(logger, "http");

            const res = await request(new App().app)
                .get("/data/us-summary")
                .expect("Content-Type", /json/)
                .expect(200);

            const expectedObject = {
                all_time_totals: {
                    total_states_affected: 51,
                    total_birds_affected: 166156928,
                    total_flocks_affected: 1604,
                    total_backyard_flocks_affected: 841,
                    total_commercial_flocks_affected: 763,
                },
                period_summaries: {
                    last_7_days: {
                        total_birds_affected: 50000,
                        total_flocks_affected: 35,
                        total_backyard_flocks_affected: 10,
                        total_commercial_flocks_affected: 25,
                    },
                    last_30_days: {
                        total_birds_affected: 1000000,
                        total_flocks_affected: 125,
                        total_backyard_flocks_affected: 50,
                        total_commercial_flocks_affected: 75,
                    },
                },
            };

            // Expect the response to match the new nested schema
            expect(res.body.data).toMatchObject(expectedObject);

            expect(loggerSpy).toHaveBeenCalledWith(
                "Received Request at US Summary /us-summary"
            );
            loggerSpy.mockClear();
        });

        afterAll(async () => {
            await USSummaryModel.getModel.db.dropDatabase();
            await Mongoose.disconnect();
        });
    });
});
