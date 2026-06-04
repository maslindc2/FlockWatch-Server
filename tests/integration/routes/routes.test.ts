import { App } from "../../../src/app";
import { FlockCasesByState } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.interface";
import dotenv from "dotenv";
import request from "supertest";
import { logger } from "../../../src/utils/winston-logger";
import { USSummaryStats } from "../../../src/modules/us-summary/us-summary-stats.interface";
import { FlockCasesByStateService } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.service";
import { USSummaryService } from "../../../src/modules/us-summary/us-summary.service";
import { SiteDetailsService } from "../../../src/modules/site-details/site-details.service";
import { SiteDetails } from "../../../src/modules/site-details/site-details.interface";
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

    // -- GET /data/sites/production-type/:productionType -----------------------

    describe("GET /data/sites/production-type/:productionType", () => {
        const siteDetails: SiteDetails[] = [
            {
                special_id: "Site 1",
                county: "County A",
                state: "State A",
                production_type: "Commercial Broiler Breeder",
                confirmed_diagnosis_date: new Date("2024-01-01"),
                status: "active",
                birds_affected: 100,
            },
            {
                special_id: "Site 2",
                county: "County B",
                state: "State B",
                production_type: "Commercial Table Eggs",
                confirmed_diagnosis_date: new Date("2024-02-01"),
                status: "released",
                birds_affected: 200,
            },
            {
                special_id: "Site 3",
                county: "County C",
                state: "State C",
                production_type: "Commercial Broiler Breeder",
                confirmed_diagnosis_date: new Date("2024-03-01"),
                status: "active",
                birds_affected: 150,
            },
            {
                special_id: "Site 4",
                county: "County D",
                state: "State D",
                production_type: "Backyard Flock",
                confirmed_diagnosis_date: new Date("2024-04-01"),
                status: "na",
                birds_affected: 10,
            },
        ];

        beforeEach(async () => {
            const siteDetailsService = new SiteDetailsService();
            await siteDetailsService.upsertSiteDetails(siteDetails);
        });

        it("should return sites matching the production type", async () => {
            const res = await request(new App().app)
                .get(
                    "/data/sites/production-type/Commercial%20Broiler%20Breeder"
                )
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body.data).toHaveLength(2);
            expect(res.body.data[0].production_type).toBe(
                "Commercial Broiler Breeder"
            );
            expect(res.body.data[1].production_type).toBe(
                "Commercial Broiler Breeder"
            );
        });

        it("should be case-insensitive", async () => {
            const res = await request(new App().app)
                .get(
                    "/data/sites/production-type/COMMERCIAL%20BROILER%20BREEDER"
                )
                .expect(200);

            expect(res.body.data).toHaveLength(2);
        });

        it("should return empty data for non-existent production type", async () => {
            const res = await request(new App().app)
                .get("/data/sites/production-type/Nonexistent%20Type")
                .expect(200);

            expect(res.body.data).toEqual([]);
            expect(res.body.total).toBe(0);
        });

        it("should support pagination via query params", async () => {
            const res = await request(new App().app)
                .get(
                    "/data/sites/production-type/Commercial%20Broiler%20Breeder?page=1&limit=1"
                )
                .expect(200);

            expect(res.body.data).toHaveLength(1);
            expect(res.body.total).toBe(2);
            expect(res.body.page).toBe(1);
            expect(res.body.limit).toBe(1);
            expect(res.body.totalPages).toBe(2);
        });

        it("should include metadata in the response", async () => {
            const res = await request(new App().app)
                .get(
                    "/data/sites/production-type/Commercial%20Broiler%20Breeder"
                )
                .expect(200);

            expect(res.body.metadata).toBeDefined();
        });
    });

    // -- GET /data/sites/production-types --------------------------------------

    describe("GET /data/sites/production-types", () => {
        const siteDetails: SiteDetails[] = [
            {
                special_id: "Site 1",
                county: "County A",
                state: "State A",
                production_type: "Commercial Broiler Breeder",
                confirmed_diagnosis_date: new Date("2024-01-01"),
                status: "active",
                birds_affected: 100,
            },
            {
                special_id: "Site 2",
                county: "County B",
                state: "State B",
                production_type: "Commercial Table Eggs",
                confirmed_diagnosis_date: new Date("2024-02-01"),
                status: "released",
                birds_affected: 200,
            },
            {
                special_id: "Site 3",
                county: "County C",
                state: "State C",
                production_type: "Backyard Flock",
                confirmed_diagnosis_date: new Date("2024-03-01"),
                status: "active",
                birds_affected: 10,
            },
        ];

        beforeEach(async () => {
            const siteDetailsService = new SiteDetailsService();
            await siteDetailsService.upsertSiteDetails(siteDetails);
        });

        it("should return all distinct production types sorted alphabetically", async () => {
            const res = await request(new App().app)
                .get("/data/sites/production-types")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body.data).toEqual([
                "Backyard Flock",
                "Commercial Broiler Breeder",
                "Commercial Table Eggs",
            ]);
        });

        it("should include metadata in the response", async () => {
            const res = await request(new App().app)
                .get("/data/sites/production-types")
                .expect(200);

            expect(res.body.metadata).toBeDefined();
        });
    });

    // -- GET /data/sites/summary -----------------------------------------------

    describe("GET /data/sites/summary", () => {
        const siteDetails: SiteDetails[] = [
            {
                special_id: "Site 1",
                county: "County A",
                state: "State A",
                production_type: "Commercial Broiler Breeder",
                confirmed_diagnosis_date: new Date("2024-01-01"),
                status: "active",
                birds_affected: 100,
            },
            {
                special_id: "Site 2",
                county: "County B",
                state: "State B",
                production_type: "Commercial Broiler Breeder",
                confirmed_diagnosis_date: new Date("2024-02-01"),
                status: "released",
                birds_affected: 200,
            },
            {
                special_id: "Site 3",
                county: "County C",
                state: "State C",
                production_type: "Commercial Broiler Breeder",
                confirmed_diagnosis_date: new Date("2024-03-01"),
                status: "released",
                birds_affected: 150,
            },
            {
                special_id: "Site 4",
                county: "County D",
                state: "State D",
                production_type: "Backyard Flock",
                confirmed_diagnosis_date: new Date("2024-04-01"),
                status: "na",
                birds_affected: 10,
            },
        ];

        beforeEach(async () => {
            const siteDetailsService = new SiteDetailsService();
            await siteDetailsService.upsertSiteDetails(siteDetails);
        });

        it("should return aggregated summaries for all production types", async () => {
            const res = await request(new App().app)
                .get("/data/sites/summary")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body.data).toHaveLength(2);

            const broilerSummary = res.body.data.find(
                (s: any) =>
                    s.production_type === "Commercial Broiler Breeder"
            );
            expect(broilerSummary).toEqual({
                production_type: "Commercial Broiler Breeder",
                total_sites: 3,
                total_birds_affected: 450,
                by_status: { active: 1, released: 2, na: 0 },
            });

            const backyardSummary = res.body.data.find(
                (s: any) => s.production_type === "Backyard Flock"
            );
            expect(backyardSummary).toEqual({
                production_type: "Backyard Flock",
                total_sites: 1,
                total_birds_affected: 10,
                by_status: { active: 0, released: 0, na: 1 },
            });
        });

        it("should return summaries sorted alphabetically by production_type", async () => {
            const res = await request(new App().app)
                .get("/data/sites/summary")
                .expect(200);

            const types = res.body.data.map(
                (s: any) => s.production_type
            );
            expect(types).toEqual([
                "Backyard Flock",
                "Commercial Broiler Breeder",
            ]);
        });

        it("should filter by production_type query param", async () => {
            const res = await request(new App().app)
                .get(
                    "/data/sites/summary?production_type=Backyard%20Flock"
                )
                .expect(200);

            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0]).toEqual({
                production_type: "Backyard Flock",
                total_sites: 1,
                total_birds_affected: 10,
                by_status: { active: 0, released: 0, na: 1 },
            });
        });

        it("should be case-insensitive when filtering by production_type", async () => {
            const res = await request(new App().app)
                .get(
                    "/data/sites/summary?production_type=BACKYARD%20FLOCK"
                )
                .expect(200);

            expect(res.body.data).toHaveLength(1);
            expect(res.body.data[0].production_type).toBe(
                "Backyard Flock"
            );
        });

        it("should return empty array for non-existent production type", async () => {
            const res = await request(new App().app)
                .get(
                    "/data/sites/summary?production_type=Nonexistent%20Type"
                )
                .expect(200);

            expect(res.body.data).toEqual([]);
        });

        it("should include metadata in the response", async () => {
            const res = await request(new App().app)
                .get("/data/sites/summary")
                .expect(200);

            expect(res.body.metadata).toBeDefined();
        });
    });

    // -- GET /data/sites/timeline ----------------------------------------------

    describe("GET /data/sites/timeline", () => {
        const siteDetails: SiteDetails[] = [
            {
                special_id: "Site 1",
                county: "County A",
                state: "State A",
                production_type: "Commercial",
                confirmed_diagnosis_date: new Date("2024-11-01"),
                status: "active",
                birds_affected: 100000,
            },
            {
                special_id: "Site 2",
                county: "County B",
                state: "State B",
                production_type: "Backyard",
                confirmed_diagnosis_date: new Date("2024-11-15"),
                status: "active",
                birds_affected: 240000,
            },
            {
                special_id: "Site 3",
                county: "County C",
                state: "State C",
                production_type: "Commercial",
                confirmed_diagnosis_date: new Date("2024-12-01"),
                status: "released",
                birds_affected: 4800000,
            },
            {
                special_id: "Site 4",
                county: "County D",
                state: "State D",
                production_type: "Commercial",
                confirmed_diagnosis_date: new Date("2024-12-20"),
                status: "active",
                birds_affected: 2000000,
            },
            {
                special_id: "Site 5",
                county: "County E",
                state: "State E",
                production_type: "Backyard",
                confirmed_diagnosis_date: new Date("2025-01-10"),
                status: "na",
                birds_affected: 50000,
            },
        ];

        beforeEach(async () => {
            const siteDetailsService = new SiteDetailsService();
            await siteDetailsService.upsertSiteDetails(siteDetails);
        });

        it("should return periods grouped by month", async () => {
            const res = await request(new App().app)
                .get("/data/sites/timeline?granularity=month")
                .expect("Content-Type", /json/)
                .expect(200);

            expect(res.body.data.granularity).toBe("month");
            expect(res.body.data.periods).toHaveLength(3);

            expect(res.body.data.periods[0]).toEqual({
                period: "2024-11",
                new_confirmations: 2,
                birds_affected: 340000,
                cumulative_birds_affected: 340000,
            });
            expect(res.body.data.periods[1]).toEqual({
                period: "2024-12",
                new_confirmations: 2,
                birds_affected: 6800000,
                cumulative_birds_affected: 7140000,
            });
            expect(res.body.data.periods[2]).toEqual({
                period: "2025-01",
                new_confirmations: 1,
                birds_affected: 50000,
                cumulative_birds_affected: 7190000,
            });
        });

        it("should default to month granularity", async () => {
            const res = await request(new App().app)
                .get("/data/sites/timeline")
                .expect(200);

            expect(res.body.data.granularity).toBe("month");
        });

        it("should return periods grouped by year", async () => {
            const res = await request(new App().app)
                .get("/data/sites/timeline?granularity=year")
                .expect(200);

            expect(res.body.data.granularity).toBe("year");

            const periods = res.body.data.periods;
            expect(periods).toHaveLength(2);
            expect(periods[0].period).toBe("2024");
            expect(periods[0].new_confirmations).toBe(4);
            expect(periods[1].period).toBe("2025");
            expect(periods[1].new_confirmations).toBe(1);
        });

        it("should return 400 for invalid granularity", async () => {
            const res = await request(new App().app)
                .get("/data/sites/timeline?granularity=invalid")
                .expect(400);

            expect(res.body.error).toContain("Invalid granularity");
        });

        it("should include metadata in the response", async () => {
            const res = await request(new App().app)
                .get("/data/sites/timeline?granularity=month")
                .expect(200);

            expect(res.body.metadata).toBeDefined();
            expect(res.body.metadata.last_scraped_date).toBeDefined();
        });
    });
});
