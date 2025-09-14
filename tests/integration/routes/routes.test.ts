import { App } from "../../../src/app";
import { FlockCasesByStateService } from "../../../src/services/model-services/flock-cases-by-state-service";
import { IFlockCasesByState } from "../../../src/interfaces/i-flock-cases-by-state";
import dotenv from "dotenv";
import * as Mongoose from "mongoose";
import request from "supertest";
import { FlockCasesByStateModel } from "../../../src/models/flock-cases-by-state-model";
import { logger } from "../../../src/utils/winston-logger";
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
                const flockData: IFlockCasesByState[] = [
                    {
                        stateAbbreviation: "WA",
                        state: "Washington",
                        backyardFlocks: 52,
                        commercialFlocks: 3,
                        birdsAffected: 2167079,
                        totalFlocks: 55,
                        latitude: 47.556837171,
                        longitude: -122.16233971,
                        lastReportedDate: new Date(Date.UTC(2025, 2 - 1, 5)),
                    },
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
        
        it("should return the flock cases for Washington State when a get request has been made to /flock-cases/WA", async () => {
            // Create a spy for our logger as we are expected to receive http logging information
            const loggerSpy = jest.spyOn(logger, "http");
            // Define the object we should get as a response.  Remember this route only returns an object not an array
            const expectedFlockData = {
                stateAbbreviation: "WA",
                state: "Washington",
                backyardFlocks: 52,
                commercialFlocks: 3,
                birdsAffected: 2167079,
                totalFlocks: 55,
                latitude: 47.556837171,
                longitude: -122.16233971,
                lastReportedDate: "2025-02-05T00:00:00.000Z",
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
        })
        afterAll(async () => {
            await FlockCasesByStateModel.getModel.db.dropDatabase();
            await Mongoose.disconnect();
        })
    })

    describe("GET /data/us-summary", () => {
        let usSummaryData: IUSSummaryStats;
        let usSummaryService: USSummaryService;

        beforeAll(async () => {
            await Mongoose.connect(process.env.MONGODB_URI!);
            usSummaryService = new USSummaryService();

            // Define the us summary model in the new schema
            usSummaryData = {
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
                allTimeTotals: {
                    totalStatesAffected: 51,
                    totalBirdsAffected: 166156928,
                    totalFlocksAffected: 1604,
                    totalBackyardFlocksAffected: 841,
                    totalCommercialFlocksAffected: 763
                },
                periodSummaries: {
                    last7Days: {
                        totalBirdsAffected: 50000,
                        totalFlocksAffected: 35,
                        totalBackyardFlocksAffected: 10,
                        totalCommercialFlocksAffected: 25
                    },
                    last30Days: {
                        totalBirdsAffected: 1000000,
                        totalFlocksAffected: 125,
                        totalBackyardFlocksAffected: 50,
                        totalCommercialFlocksAffected: 75
                    }
                }
            }
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
