import { App } from "../../../src/app";
import { FlockCasesByState } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.interface";
import dotenv from "dotenv";
import request from "supertest";
import { logger } from "../../../src/utils/winston-logger";
import { USSummaryStats } from "../../../src/modules/us-summary/us-summary-stats.interface";
import { FlockCasesByStateService } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.service";
import { USSummaryService } from "../../../src/modules/us-summary/us-summary.service";
import { connect, disconnect, clearCollections } from "../setup/mongodb-setup";

dotenv.config();

describe("Routes integration tests", () => {
    beforeAll(async () => {
        await connect();
    });

    afterEach(async () => {
        await clearCollections();
    });

    afterAll(async () => {
        await disconnect();
    });

    // -- GET / ----------------------------------------------------------------

    describe("GET root url", () => {
        it("should return root api message when root url is requested", async () => {
            const res = await request(new App().app)
                .get("/")
                .expect("Content-Type", /json/)
                .expect(200);
            expect(res.body.message).toEqual("Nothing here but us Chickens");
        });
    });

    // -- GET /data/flock-cases ------------------------------------------------

    describe("GET /data/flock-cases", () => {
        beforeEach(async () => {
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
                    last_reported_detection: new Date(Date.UTC(2025, 2 - 1, 5)),
                },
            ];
            const flockCasesService = new FlockCasesByStateService();
            await flockCasesService.createOrUpdateStateData(flockData);
        });

        it("should return all us flock cases when a GET request is made to /data/flock-cases", async () => {
            const loggerSpy = jest.spyOn(logger, "http");
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
    });

    // -- GET /data/flock-cases/:stateAbbreviation -----------------------------

    describe("GET /data/flock-cases/:stateAbbreviation", () => {
        beforeEach(async () => {
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
                    last_reported_detection: new Date(Date.UTC(2025, 2 - 1, 5)),
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
                    last_reported_detection: new Date(Date.UTC(2025, 2 - 1, 5)),
                },
            ];
            const flockCasesService = new FlockCasesByStateService();
            await flockCasesService.createOrUpdateStateData(flockData);
        });

        it("should return the flock cases for Washington State when a GET request is made to /flock-cases/WA", async () => {
            const loggerSpy = jest.spyOn(logger, "http");
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
    });

    // -- GET /data/us-summary -------------------------------------------------

    describe("GET /data/us-summary", () => {
        beforeEach(async () => {
            const usSummaryData: USSummaryStats = {
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
            const usSummaryService = new USSummaryService();
            await usSummaryService.upsertUSSummary(usSummaryData);
        });

        it("should return all-time totals and period summaries correctly", async () => {
            const loggerSpy = jest.spyOn(logger, "http");
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

            const res = await request(new App().app)
                .get("/data/us-summary")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body.data).toMatchObject(expectedObject);
            expect(loggerSpy).toHaveBeenCalledWith(
                "Received Request at US Summary /us-summary"
            );
            loggerSpy.mockClear();
        });
    });
});