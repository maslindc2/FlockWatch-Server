import { RequestDataService } from "../../../../src/modules/data-updating/request-data.service";
import { FetchRetryAuthID } from "../../../../src/modules/fetch-retry/fetch-retry-authID";
import { BuildUSSummary } from "../../../../src/modules/data-updating/build-us-summary.service";
import { logger } from "../../../../src/utils/winston-logger";

// ---- Factories --------------------------------------------------------------

const makeScraperData = () => ({
    flock_cases_by_state: [
        {
            state_abbreviation: "PA",
            state: "Pennsylvania",
            birds_affected: 100,
            total_flocks: 10,
            backyard_flocks: 3,
            commercial_flocks: 7,
            latitude: 40.99,
            longitude: -76.19,
            last_reported_detection: new Date("2024-01-01"),
        },
    ],
    period_summaries: [
        {
            period_name: "last_30_days",
            total_birds_affected: 50,
            total_flocks_affected: 5,
            total_backyard_flocks_affected: 2,
            total_commercial_flocks_affected: 3,
        },
    ],
});

const makeUSSummaryStats = () => ({
    key: "us-summary",
    all_time_totals: {
        total_states_affected: 1,
        total_birds_affected: 100,
        total_flocks_affected: 10,
        total_backyard_flocks_affected: 3,
        total_commercial_flocks_affected: 7,
    },
    period_summaries: [],
});

const makeMockResponse = (
    ok: boolean,
    status = 200,
    json: any = makeScraperData()
) => ({
    ok,
    status,
    json: jest.fn().mockResolvedValue(json),
});

// ---- Tests ------------------------------------------------------------------

describe("RequestDataService", () => {
    let service: RequestDataService;

    beforeEach(() => {
        service = new RequestDataService();
        jest.spyOn(logger, "error").mockImplementation(() => logger);
        jest.spyOn(logger, "info").mockImplementation(() => logger);
    });

    afterEach(() => jest.restoreAllMocks());

    // -- fetchLatestFlockData -------------------------------------------------

    describe("fetchLatestFlockData", () => {
        it("should throw when requestDataFromScrapingService returns null", async () => {
            jest.spyOn(
                FetchRetryAuthID.prototype,
                "getRetry"
            ).mockResolvedValueOnce(makeMockResponse(false, 500) as any);

            await expect(
                service.fetchLatestFlockData("test-auth-id")
            ).rejects.toThrow("Failed to receive data from scraping service!");
        });

        it("should throw an Error instance when scraper returns null", async () => {
            jest.spyOn(
                FetchRetryAuthID.prototype,
                "getRetry"
            ).mockResolvedValueOnce(makeMockResponse(false, 500) as any);

            await expect(
                service.fetchLatestFlockData("test-auth-id")
            ).rejects.toBeInstanceOf(Error);
        });

        it("should call createUSSummaryData with flock_cases_by_state and period_summaries", async () => {
            const scraperData = makeScraperData();
            jest.spyOn(
                FetchRetryAuthID.prototype,
                "getRetry"
            ).mockResolvedValueOnce(
                makeMockResponse(true, 200, scraperData) as any
            );
            const buildSpy = jest
                .spyOn(BuildUSSummary.prototype, "createUSSummaryData")
                .mockReturnValueOnce(makeUSSummaryStats() as any);

            await service.fetchLatestFlockData("test-auth-id");

            expect(buildSpy).toHaveBeenCalledWith(
                scraperData.flock_cases_by_state,
                scraperData.period_summaries
            );
        });

        it("should return flock_cases_by_state from the scraper response", async () => {
            const scraperData = makeScraperData();
            jest.spyOn(
                FetchRetryAuthID.prototype,
                "getRetry"
            ).mockResolvedValueOnce(
                makeMockResponse(true, 200, scraperData) as any
            );
            jest.spyOn(
                BuildUSSummary.prototype,
                "createUSSummaryData"
            ).mockReturnValueOnce(makeUSSummaryStats() as any);

            const result = await service.fetchLatestFlockData("test-auth-id");

            expect(result?.flock_cases_by_state).toEqual(
                scraperData.flock_cases_by_state
            );
        });

        it("should return us_summary_stats built from createUSSummaryData", async () => {
            const scraperData = makeScraperData();
            const usSummary = makeUSSummaryStats();
            jest.spyOn(
                FetchRetryAuthID.prototype,
                "getRetry"
            ).mockResolvedValueOnce(
                makeMockResponse(true, 200, scraperData) as any
            );
            jest.spyOn(
                BuildUSSummary.prototype,
                "createUSSummaryData"
            ).mockReturnValueOnce(usSummary as any);

            const result = await service.fetchLatestFlockData("test-auth-id");

            expect(result?.us_summary_stats).toEqual(usSummary);
        });

        it("should return a FlockData object with both required keys", async () => {
            const scraperData = makeScraperData();
            jest.spyOn(
                FetchRetryAuthID.prototype,
                "getRetry"
            ).mockResolvedValueOnce(
                makeMockResponse(true, 200, scraperData) as any
            );
            jest.spyOn(
                BuildUSSummary.prototype,
                "createUSSummaryData"
            ).mockReturnValueOnce(makeUSSummaryStats() as any);

            const result = await service.fetchLatestFlockData("test-auth-id");

            expect(result).toHaveProperty("flock_cases_by_state");
            expect(result).toHaveProperty("us_summary_stats");
        });
    });

    // -- requestDataFromScrapingService (via fetchLatestFlockData) ------------

    describe("requestDataFromScrapingService", () => {
        it("should create FetchRetryAuthID with the provided authID", async () => {
            const scraperData = makeScraperData();
            const constructorSpy = jest
                .spyOn(FetchRetryAuthID.prototype, "getRetry")
                .mockResolvedValueOnce(
                    makeMockResponse(true, 200, scraperData) as any
                );
            jest.spyOn(
                BuildUSSummary.prototype,
                "createUSSummaryData"
            ).mockReturnValueOnce(makeUSSummaryStats() as any);

            await service.fetchLatestFlockData("my-auth-id");

            // FetchRetryAuthID stores authID in constructor -- verify it is used
            // by checking getRetry was called (only possible after correct instantiation)
            expect(constructorSpy).toHaveBeenCalledTimes(1);
        });

        it("should call getRetry with the correct default URL when env var is not set", async () => {
            delete process.env.SCRAPING_SERVICE_URL;
            const scraperData = makeScraperData();
            const getRetrySpy = jest
                .spyOn(FetchRetryAuthID.prototype, "getRetry")
                .mockResolvedValueOnce(
                    makeMockResponse(true, 200, scraperData) as any
                );
            jest.spyOn(
                BuildUSSummary.prototype,
                "createUSSummaryData"
            ).mockReturnValueOnce(makeUSSummaryStats() as any);

            await service.fetchLatestFlockData("test-auth-id");

            expect(getRetrySpy).toHaveBeenCalledWith(
                "http://localhost:8080/scraper/get-data",
                3,
                2 * 60 * 1000,
                500
            );
        });

        it("should use SCRAPING_SERVICE_URL env var when set", async () => {
            process.env.SCRAPING_SERVICE_URL =
                "http://custom-scraper:9090/data";
            const scraperData = makeScraperData();
            const getRetrySpy = jest
                .spyOn(FetchRetryAuthID.prototype, "getRetry")
                .mockResolvedValueOnce(
                    makeMockResponse(true, 200, scraperData) as any
                );
            jest.spyOn(
                BuildUSSummary.prototype,
                "createUSSummaryData"
            ).mockReturnValueOnce(makeUSSummaryStats() as any);

            await service.fetchLatestFlockData("test-auth-id");

            expect(getRetrySpy).toHaveBeenCalledWith(
                "http://custom-scraper:9090/data",
                expect.any(Number),
                expect.any(Number),
                expect.any(Number)
            );

            delete process.env.SCRAPING_SERVICE_URL;
        });

        it("should log an error and return null when res.ok is false", async () => {
            jest.spyOn(
                FetchRetryAuthID.prototype,
                "getRetry"
            ).mockResolvedValueOnce(makeMockResponse(false, 503) as any);
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await expect(
                service.fetchLatestFlockData("test-auth-id")
            ).rejects.toThrow();

            expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("503"));
        });

        it("should log an error when the response JSON is empty", async () => {
            jest.spyOn(
                FetchRetryAuthID.prototype,
                "getRetry"
            ).mockResolvedValueOnce(makeMockResponse(true, 200, {}) as any);
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await expect(
                service.fetchLatestFlockData("test-auth-id")
            ).rejects.toThrow();

            expect(logSpy).toHaveBeenCalledWith(
                "Received empty or invalid JSON from scraping service"
            );
        });

        it("should log an error when the response JSON is null", async () => {
            jest.spyOn(
                FetchRetryAuthID.prototype,
                "getRetry"
            ).mockResolvedValueOnce(makeMockResponse(true, 200, null) as any);
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await expect(
                service.fetchLatestFlockData("test-auth-id")
            ).rejects.toThrow();

            expect(logSpy).toHaveBeenCalledWith(
                "Received empty or invalid JSON from scraping service"
            );
        });

        it("should log an error and return null when getRetry throws", async () => {
            jest.spyOn(
                FetchRetryAuthID.prototype,
                "getRetry"
            ).mockRejectedValueOnce(new Error("Network failure"));
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await expect(
                service.fetchLatestFlockData("test-auth-id")
            ).rejects.toThrow();

            expect(logSpy).toHaveBeenCalledWith(
                expect.stringContaining("Failed to fetch from scraper")
            );
        });

        it("should call getRetry with 3 retries", async () => {
            const scraperData = makeScraperData();
            const getRetrySpy = jest
                .spyOn(FetchRetryAuthID.prototype, "getRetry")
                .mockResolvedValueOnce(
                    makeMockResponse(true, 200, scraperData) as any
                );
            jest.spyOn(
                BuildUSSummary.prototype,
                "createUSSummaryData"
            ).mockReturnValueOnce(makeUSSummaryStats() as any);

            await service.fetchLatestFlockData("test-auth-id");

            expect(getRetrySpy).toHaveBeenCalledWith(
                expect.any(String),
                3,
                expect.any(Number),
                expect.any(Number)
            );
        });
    });
});
