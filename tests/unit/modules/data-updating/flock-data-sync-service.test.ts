import { FlockDataSyncService } from "../../../../src/modules/data-updating/flock-data-sync.service";
import { LastReportDateService } from "../../../../src/modules/last-report-date/last-report-date.service";
import { RequestDataService } from "../../../../src/modules/data-updating/request-data.service";
import { FlockDataUpdateService } from "../../../../src/modules/data-updating/flock-data-update.service";
import { logger } from "../../../../src/utils/winston-logger";

// ---- Helpers ----------------------------------------------------------------

const makeLastScrapedDate = (
    hoursAgo: number
): { last_scraped_date: string } => {
    const date = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
    return { last_scraped_date: date.toISOString() };
};

// ---- Tests ------------------------------------------------------------------

describe("FlockDataSyncService", () => {
    let service: FlockDataSyncService;

    beforeEach(() => {
        service = new FlockDataSyncService();
        jest.spyOn(logger, "info").mockImplementation(() => logger);
        jest.spyOn(logger, "silly").mockImplementation(() => logger);
        jest.spyOn(logger, "error").mockImplementation(() => logger);
    });

    afterEach(() => jest.restoreAllMocks());

    // -- syncIfOutdated -------------------------------------------------------

    describe("syncIfOutdated", () => {
        it("should call getLastScrapedDate on the service", async () => {
            const getDateSpy = jest
                .spyOn(LastReportDateService.prototype, "getLastScrapedDate")
                .mockResolvedValueOnce(makeLastScrapedDate(1) as any);

            await service.syncIfOutdated();

            expect(getDateSpy).toHaveBeenCalledTimes(1);
        });

        it("should log info and request new data when last_scraped_date is missing", async () => {
            jest.spyOn(
                LastReportDateService.prototype,
                "getLastScrapedDate"
            ).mockResolvedValueOnce(null);
            jest.spyOn(
                LastReportDateService.prototype,
                "getAuthID"
            ).mockResolvedValueOnce({ auth_id: "test-id" } as any);
            jest.spyOn(
                RequestDataService.prototype,
                "fetchLatestFlockData"
            ).mockResolvedValueOnce(null as any);
            jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            ).mockResolvedValueOnce(undefined);
            const logSpy = jest
                .spyOn(logger, "info")
                .mockImplementation(() => logger);

            await service.syncIfOutdated();

            expect(logSpy).toHaveBeenCalledWith(
                "Database information is out of date, requesting new info!"
            );
        });

        it("should log info and request new data when data is outdated (>= 24 hours)", async () => {
            jest.spyOn(
                LastReportDateService.prototype,
                "getLastScrapedDate"
            ).mockResolvedValueOnce(makeLastScrapedDate(25) as any);
            jest.spyOn(
                LastReportDateService.prototype,
                "getAuthID"
            ).mockResolvedValueOnce({ auth_id: "test-id" } as any);
            jest.spyOn(
                RequestDataService.prototype,
                "fetchLatestFlockData"
            ).mockResolvedValueOnce(null as any);
            jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            ).mockResolvedValueOnce(undefined);
            const logSpy = jest
                .spyOn(logger, "info")
                .mockImplementation(() => logger);

            await service.syncIfOutdated();

            expect(logSpy).toHaveBeenCalledWith(
                "Database information is out of date, requesting new info!"
            );
        });

        it("should log silly and skip update when data is up to date (< 24 hours)", async () => {
            jest.spyOn(
                LastReportDateService.prototype,
                "getLastScrapedDate"
            ).mockResolvedValueOnce(makeLastScrapedDate(1) as any);
            const sillySpy = jest
                .spyOn(logger, "silly")
                .mockImplementation(() => logger);

            await service.syncIfOutdated();

            expect(sillySpy).toHaveBeenCalledWith(
                "Database is up to date no need for changes!"
            );
        });

        it("should not call getAuthID when data is up to date", async () => {
            jest.spyOn(
                LastReportDateService.prototype,
                "getLastScrapedDate"
            ).mockResolvedValueOnce(makeLastScrapedDate(1) as any);
            const getAuthSpy = jest.spyOn(
                LastReportDateService.prototype,
                "getAuthID"
            );

            await service.syncIfOutdated();

            expect(getAuthSpy).not.toHaveBeenCalled();
        });

        it("should treat exactly 24 hours ago as outdated", async () => {
            jest.spyOn(
                LastReportDateService.prototype,
                "getLastScrapedDate"
            ).mockResolvedValueOnce(makeLastScrapedDate(24) as any);
            jest.spyOn(
                LastReportDateService.prototype,
                "getAuthID"
            ).mockResolvedValueOnce({ auth_id: "test-id" } as any);
            jest.spyOn(
                RequestDataService.prototype,
                "fetchLatestFlockData"
            ).mockResolvedValueOnce(null as any);
            jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            ).mockResolvedValueOnce(undefined);
            const logSpy = jest
                .spyOn(logger, "info")
                .mockImplementation(() => logger);

            await service.syncIfOutdated();

            expect(logSpy).toHaveBeenCalledWith(
                "Database information is out of date, requesting new info!"
            );
        });
    });

    // -- requestAndApplyData (via syncIfOutdated) ------------------------------

    describe("requestAndApplyData", () => {
        beforeEach(() => {
            // Force the outdated path for all tests in this block
            jest.spyOn(
                LastReportDateService.prototype,
                "getLastScrapedDate"
            ).mockResolvedValue(makeLastScrapedDate(25) as any);
        });

        it("should call getAuthID to retrieve the auth ID", async () => {
            const getAuthSpy = jest
                .spyOn(LastReportDateService.prototype, "getAuthID")
                .mockResolvedValueOnce({ auth_id: "test-id" } as any);
            jest.spyOn(
                RequestDataService.prototype,
                "fetchLatestFlockData"
            ).mockResolvedValueOnce(null as any);
            jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            ).mockResolvedValueOnce(undefined);

            await service.syncIfOutdated();

            expect(getAuthSpy).toHaveBeenCalledTimes(1);
        });

        it("should handle null modelInfo gracefully", async () => {
            jest.spyOn(
                LastReportDateService.prototype,
                "getAuthID"
            ).mockResolvedValueOnce(null as any);
            const fetchSpy = jest
                .spyOn(RequestDataService.prototype, "fetchLatestFlockData");
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await service.syncIfOutdated();

            expect(logSpy).toHaveBeenCalledWith(
                "No auth ID found for requesting data!"
            );
            expect(fetchSpy).not.toHaveBeenCalled();
        });

        it("should call fetchLatestFlockData with the auth ID", async () => {
            jest.spyOn(
                LastReportDateService.prototype,
                "getAuthID"
            ).mockResolvedValueOnce({ auth_id: "my-auth-id" } as any);
            const fetchSpy = jest
                .spyOn(RequestDataService.prototype, "fetchLatestFlockData")
                .mockResolvedValueOnce(null as any);
            jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            ).mockResolvedValueOnce(undefined);

            await service.syncIfOutdated();

            expect(fetchSpy).toHaveBeenCalledWith("my-auth-id");
        });

        it("should log an error when fetchLatestFlockData returns null", async () => {
            jest.spyOn(
                LastReportDateService.prototype,
                "getAuthID"
            ).mockResolvedValueOnce({ auth_id: "test-id" } as any);
            jest.spyOn(
                RequestDataService.prototype,
                "fetchLatestFlockData"
            ).mockResolvedValueOnce(null as any);
            jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            ).mockResolvedValueOnce(undefined);
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await service.syncIfOutdated();

            expect(logSpy).toHaveBeenCalledWith("Data is empty!");
        });

        it("should call updateLastReportDate with false when data is empty", async () => {
            jest.spyOn(
                LastReportDateService.prototype,
                "getAuthID"
            ).mockResolvedValueOnce({ auth_id: "test-id" } as any);
            jest.spyOn(
                RequestDataService.prototype,
                "fetchLatestFlockData"
            ).mockResolvedValueOnce(null as any);
            const updateDateSpy = jest
                .spyOn(LastReportDateService.prototype, "updateLastReportDate")
                .mockResolvedValueOnce(undefined);

            await service.syncIfOutdated();

            expect(updateDateSpy).toHaveBeenCalledWith(false);
        });

        it("should not call applyUpdate when data is empty", async () => {
            jest.spyOn(
                LastReportDateService.prototype,
                "getAuthID"
            ).mockResolvedValueOnce({ auth_id: "test-id" } as any);
            jest.spyOn(
                RequestDataService.prototype,
                "fetchLatestFlockData"
            ).mockResolvedValueOnce(null as any);
            jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            ).mockResolvedValueOnce(undefined);
            const applyUpdateSpy = jest.spyOn(
                FlockDataUpdateService.prototype,
                "applyUpdate"
            );

            await service.syncIfOutdated();

            expect(applyUpdateSpy).not.toHaveBeenCalled();
        });

        it("should call applyUpdate with the fetched data when data is present", async () => {
            const fakeData = { flock_cases_by_state: [], us_summary_stats: {} };
            jest.spyOn(
                LastReportDateService.prototype,
                "getAuthID"
            ).mockResolvedValueOnce({ auth_id: "test-id" } as any);
            jest.spyOn(
                RequestDataService.prototype,
                "fetchLatestFlockData"
            ).mockResolvedValueOnce(fakeData as any);
            const applyUpdateSpy = jest
                .spyOn(FlockDataUpdateService.prototype, "applyUpdate")
                .mockResolvedValueOnce({} as any);

            await service.syncIfOutdated();

            expect(applyUpdateSpy).toHaveBeenCalledWith(fakeData);
        });

        it("should not call updateLastReportDate when data is present", async () => {
            const fakeData = { flock_cases_by_state: [], us_summary_stats: {} };
            jest.spyOn(
                LastReportDateService.prototype,
                "getAuthID"
            ).mockResolvedValueOnce({ auth_id: "test-id" } as any);
            jest.spyOn(
                RequestDataService.prototype,
                "fetchLatestFlockData"
            ).mockResolvedValueOnce(fakeData as any);
            jest.spyOn(
                FlockDataUpdateService.prototype,
                "applyUpdate"
            ).mockResolvedValueOnce({} as any);
            const updateDateSpy = jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            );

            await service.syncIfOutdated();

            expect(updateDateSpy).not.toHaveBeenCalled();
        });
    });
});
