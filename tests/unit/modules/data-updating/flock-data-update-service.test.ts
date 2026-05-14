import { FlockDataUpdateService } from "../../../../src/modules/data-updating/flock-data-update.service";
import { FlockCasesByStateService } from "../../../../src/modules/flock-cases-by-state/flock-cases-by-state.service";
import { USSummaryService } from "../../../../src/modules/us-summary/us-summary.service";
import { LastReportDateService } from "../../../../src/modules/last-report-date/last-report-date.service";
import { SiteDetailsService } from "../../../../src/modules/site-details/site-details.service";
import { HistoricalSummaryService } from "../../../../src/modules/historical-summary/historical-summary.service";
import { StatusSummaryService } from "../../../../src/modules/status-summary/status-summary.service";
import { logger } from "../../../../src/utils/winston-logger";
import { FlockData } from "../../../../src/modules/data-updating/flock-data.interface";

// ---- Factories --------------------------------------------------------------

const makeFlockData = (overrides: Partial<FlockData> = {}): FlockData => ({
    flock_cases_by_state: [],
    us_summary_stats: {
        key: "us-summary",
        all_time_totals: {
            total_states_affected: 0,
            total_birds_affected: 0,
            total_flocks_affected: 0,
            total_backyard_flocks_affected: 0,
            total_commercial_flocks_affected: 0,
        },
        period_summaries: [],
    },
    site_details: [],
    historical_summary: {
        total_birds_affected_all_time: 0,
        total_sites_all_time: 0,
        total_active_sites: 0,
        total_released_sites: 0,
        total_na_sites: 0,
        total_birds_active: 0,
    },
    status_summary: {
        sites_confirmed_last_30_days: 0,
        sites_released_last_30_days: 0,
        birds_affected_last_30_days: 0,
    },
    ...overrides,
});

// ---- Tests ------------------------------------------------------------------

describe("FlockDataUpdateService", () => {
    let service: FlockDataUpdateService;

    beforeEach(() => {
        service = new FlockDataUpdateService();
        jest.spyOn(logger, "info").mockImplementation(() => logger);
        jest.spyOn(logger, "error").mockImplementation(() => logger);
    });

    afterEach(() => jest.restoreAllMocks());

    // -- happy path -----------------------------------------------------------

    describe("applyUpdate - happy path", () => {
        beforeEach(() => {
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "createOrUpdateStateData"
            ).mockResolvedValue({} as any);
            jest.spyOn(
                USSummaryService.prototype,
                "upsertUSSummary"
            ).mockResolvedValue({} as any);
            jest.spyOn(
                SiteDetailsService.prototype,
                "upsertSiteDetails"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                HistoricalSummaryService.prototype,
                "upsertHistoricalSummary"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                StatusSummaryService.prototype,
                "upsertStatusSummary"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            ).mockResolvedValue(undefined);
        });

        it("should call createOrUpdateStateData with flock_cases_by_state", async () => {
            const data = makeFlockData({
                flock_cases_by_state: [{ state_abbreviation: "PA" } as any],
            });
            const spy = jest
                .spyOn(
                    FlockCasesByStateService.prototype,
                    "createOrUpdateStateData"
                )
                .mockResolvedValue({} as any);

            await service.applyUpdate(data);

            expect(spy).toHaveBeenCalledWith(data.flock_cases_by_state);
        });

        it("should call upsertUSSummary with us_summary_stats", async () => {
            const data = makeFlockData();
            const spy = jest
                .spyOn(USSummaryService.prototype, "upsertUSSummary")
                .mockResolvedValue({} as any);

            await service.applyUpdate(data);

            expect(spy).toHaveBeenCalledWith(data.us_summary_stats);
        });

        it("should call updateLastReportDate with true on full success", async () => {
            const spy = jest
                .spyOn(LastReportDateService.prototype, "updateLastReportDate")
                .mockResolvedValue(undefined);

            await service.applyUpdate(makeFlockData());

            expect(spy).toHaveBeenCalledWith(true);
        });

        it("should return true on full success", async () => {
            const result = await service.applyUpdate(makeFlockData());
            expect(result).toBe(true);
        });

        it("should log success after createOrUpdateStateData", async () => {
            const logSpy = jest
                .spyOn(logger, "info")
                .mockImplementation(() => logger);

            await service.applyUpdate(makeFlockData());

            expect(logSpy).toHaveBeenCalledWith(
                "Finished updating state data in the database!"
            );
        });

        it("should log success after upsertUSSummary", async () => {
            const logSpy = jest
                .spyOn(logger, "info")
                .mockImplementation(() => logger);

            await service.applyUpdate(makeFlockData());

            expect(logSpy).toHaveBeenCalledWith(
                "Finished updating US Summary Stats!"
            );
        });

        it("should always call updateLastReportDate exactly once", async () => {
            const spy = jest
                .spyOn(LastReportDateService.prototype, "updateLastReportDate")
                .mockResolvedValue(undefined);

            await service.applyUpdate(makeFlockData());

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    // -- createOrUpdateStateData failure --------------------------------------

    describe("applyUpdate - createOrUpdateStateData fails", () => {
        beforeEach(() => {
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "createOrUpdateStateData"
            ).mockRejectedValue(new Error("State DB error"));
            jest.spyOn(
                USSummaryService.prototype,
                "upsertUSSummary"
            ).mockResolvedValue({} as any);
            jest.spyOn(
                SiteDetailsService.prototype,
                "upsertSiteDetails"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                HistoricalSummaryService.prototype,
                "upsertHistoricalSummary"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                StatusSummaryService.prototype,
                "upsertStatusSummary"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            ).mockResolvedValue(undefined);
        });

        it("should log an error when createOrUpdateStateData fails", async () => {
            const error = new Error("State DB error");
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "createOrUpdateStateData"
            ).mockRejectedValue(error);
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await service.applyUpdate(makeFlockData());

            expect(logSpy).toHaveBeenCalledWith(
                "Failed updating flock cases by state",
                error
            );
        });

        it("should still call upsertUSSummary when createOrUpdateStateData fails", async () => {
            const spy = jest
                .spyOn(USSummaryService.prototype, "upsertUSSummary")
                .mockResolvedValue({} as any);

            await service.applyUpdate(makeFlockData());

            expect(spy).toHaveBeenCalledTimes(1);
        });

        it("should call updateLastReportDate with false when createOrUpdateStateData fails", async () => {
            const spy = jest
                .spyOn(LastReportDateService.prototype, "updateLastReportDate")
                .mockResolvedValue(undefined);

            await service.applyUpdate(makeFlockData());

            expect(spy).toHaveBeenCalledWith(false);
        });

        it("should return false when createOrUpdateStateData fails", async () => {
            const result = await service.applyUpdate(makeFlockData());
            expect(result).toBe(false);
        });
    });

    // -- upsertUSSummary failure ----------------------------------------------

    describe("applyUpdate - upsertUSSummary fails", () => {
        beforeEach(() => {
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "createOrUpdateStateData"
            ).mockResolvedValue({} as any);
            jest.spyOn(
                USSummaryService.prototype,
                "upsertUSSummary"
            ).mockRejectedValue(new Error("Summary DB error"));
            jest.spyOn(
                SiteDetailsService.prototype,
                "upsertSiteDetails"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                HistoricalSummaryService.prototype,
                "upsertHistoricalSummary"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                StatusSummaryService.prototype,
                "upsertStatusSummary"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            ).mockResolvedValue(undefined);
        });

        it("should log an error when upsertUSSummary fails", async () => {
            const error = new Error("Summary DB error");
            jest.spyOn(
                USSummaryService.prototype,
                "upsertUSSummary"
            ).mockRejectedValue(error);
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await service.applyUpdate(makeFlockData());

            expect(logSpy).toHaveBeenCalledWith(
                "Failed updating US Summary Stats",
                error
            );
        });

        it("should call updateLastReportDate with false when upsertUSSummary fails", async () => {
            const spy = jest
                .spyOn(LastReportDateService.prototype, "updateLastReportDate")
                .mockResolvedValue(undefined);

            await service.applyUpdate(makeFlockData());

            expect(spy).toHaveBeenCalledWith(false);
        });

        it("should return false when upsertUSSummary fails", async () => {
            const result = await service.applyUpdate(makeFlockData());
            expect(result).toBe(false);
        });
    });

    // -- upsertSiteDetails failure -------------------------------------------

    describe("applyUpdate - upsertSiteDetails fails", () => {
        beforeEach(() => {
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "createOrUpdateStateData"
            ).mockResolvedValue({} as any);
            jest.spyOn(
                USSummaryService.prototype,
                "upsertUSSummary"
            ).mockResolvedValue({} as any);
            jest.spyOn(
                SiteDetailsService.prototype,
                "upsertSiteDetails"
            ).mockRejectedValue(new Error("Site DB error"));
            jest.spyOn(
                HistoricalSummaryService.prototype,
                "upsertHistoricalSummary"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                StatusSummaryService.prototype,
                "upsertStatusSummary"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            ).mockResolvedValue(undefined);
        });

        it("should log an error when upsertSiteDetails fails", async () => {
            const error = new Error("Site DB error");
            jest.spyOn(
                SiteDetailsService.prototype,
                "upsertSiteDetails"
            ).mockRejectedValue(error);
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await service.applyUpdate(makeFlockData());

            expect(logSpy).toHaveBeenCalledWith(
                "Failed updating site details",
                error
            );
        });

        it("should call updateLastReportDate with false when upsertSiteDetails fails", async () => {
            const spy = jest
                .spyOn(LastReportDateService.prototype, "updateLastReportDate")
                .mockResolvedValue(undefined);

            await service.applyUpdate(makeFlockData());

            expect(spy).toHaveBeenCalledWith(false);
        });

        it("should return false when upsertSiteDetails fails", async () => {
            const result = await service.applyUpdate(makeFlockData());
            expect(result).toBe(false);
        });
    });

    // -- upsertHistoricalSummary failure --------------------------------------

    describe("applyUpdate - upsertHistoricalSummary fails", () => {
        beforeEach(() => {
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "createOrUpdateStateData"
            ).mockResolvedValue({} as any);
            jest.spyOn(
                USSummaryService.prototype,
                "upsertUSSummary"
            ).mockResolvedValue({} as any);
            jest.spyOn(
                SiteDetailsService.prototype,
                "upsertSiteDetails"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                HistoricalSummaryService.prototype,
                "upsertHistoricalSummary"
            ).mockRejectedValue(new Error("Historical DB error"));
            jest.spyOn(
                StatusSummaryService.prototype,
                "upsertStatusSummary"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            ).mockResolvedValue(undefined);
        });

        it("should log an error when upsertHistoricalSummary fails", async () => {
            const error = new Error("Historical DB error");
            jest.spyOn(
                HistoricalSummaryService.prototype,
                "upsertHistoricalSummary"
            ).mockRejectedValue(error);
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await service.applyUpdate(makeFlockData());

            expect(logSpy).toHaveBeenCalledWith(
                "Failed updating historical summary",
                error
            );
        });

        it("should call updateLastReportDate with false when upsertHistoricalSummary fails", async () => {
            const spy = jest
                .spyOn(LastReportDateService.prototype, "updateLastReportDate")
                .mockResolvedValue(undefined);

            await service.applyUpdate(makeFlockData());

            expect(spy).toHaveBeenCalledWith(false);
        });

        it("should return false when upsertHistoricalSummary fails", async () => {
            const result = await service.applyUpdate(makeFlockData());
            expect(result).toBe(false);
        });
    });

    // -- upsertStatusSummary failure ------------------------------------------

    describe("applyUpdate - upsertStatusSummary fails", () => {
        beforeEach(() => {
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "createOrUpdateStateData"
            ).mockResolvedValue({} as any);
            jest.spyOn(
                USSummaryService.prototype,
                "upsertUSSummary"
            ).mockResolvedValue({} as any);
            jest.spyOn(
                SiteDetailsService.prototype,
                "upsertSiteDetails"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                HistoricalSummaryService.prototype,
                "upsertHistoricalSummary"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                StatusSummaryService.prototype,
                "upsertStatusSummary"
            ).mockRejectedValue(new Error("Status DB error"));
            jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            ).mockResolvedValue(undefined);
        });

        it("should log an error when upsertStatusSummary fails", async () => {
            const error = new Error("Status DB error");
            jest.spyOn(
                StatusSummaryService.prototype,
                "upsertStatusSummary"
            ).mockRejectedValue(error);
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await service.applyUpdate(makeFlockData());

            expect(logSpy).toHaveBeenCalledWith(
                "Failed updating status summary",
                error
            );
        });

        it("should call updateLastReportDate with false when upsertStatusSummary fails", async () => {
            const spy = jest
                .spyOn(LastReportDateService.prototype, "updateLastReportDate")
                .mockResolvedValue(undefined);

            await service.applyUpdate(makeFlockData());

            expect(spy).toHaveBeenCalledWith(false);
        });

        it("should return false when upsertStatusSummary fails", async () => {
            const result = await service.applyUpdate(makeFlockData());
            expect(result).toBe(false);
        });
    });

    // -- both services fail ---------------------------------------------------

    describe("applyUpdate - both services fail", () => {
        beforeEach(() => {
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "createOrUpdateStateData"
            ).mockRejectedValue(new Error("State DB error"));
            jest.spyOn(
                USSummaryService.prototype,
                "upsertUSSummary"
            ).mockRejectedValue(new Error("Summary DB error"));
            jest.spyOn(
                SiteDetailsService.prototype,
                "upsertSiteDetails"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                HistoricalSummaryService.prototype,
                "upsertHistoricalSummary"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                StatusSummaryService.prototype,
                "upsertStatusSummary"
            ).mockResolvedValue(undefined);
            jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            ).mockResolvedValue(undefined);
        });

        it("should call updateLastReportDate with false when both services fail", async () => {
            const spy = jest
                .spyOn(LastReportDateService.prototype, "updateLastReportDate")
                .mockResolvedValue(undefined);

            await service.applyUpdate(makeFlockData());

            expect(spy).toHaveBeenCalledWith(false);
        });

        it("should return false when both services fail", async () => {
            const result = await service.applyUpdate(makeFlockData());
            expect(result).toBe(false);
        });

        it("should log both error messages when both services fail", async () => {
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await service.applyUpdate(makeFlockData());

            const messages = logSpy.mock.calls.map((call: any) => call[0]);
            expect(messages).toContain("Failed updating flock cases by state");
            expect(messages).toContain("Failed updating US Summary Stats");
        });

        it("should still call updateLastReportDate even when both services fail", async () => {
            const spy = jest
                .spyOn(LastReportDateService.prototype, "updateLastReportDate")
                .mockResolvedValue(undefined);

            await service.applyUpdate(makeFlockData());

            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    // -- call order -----------------------------------------------------------

    describe("applyUpdate - call order", () => {
        it("should call updateLastReportDate only after all update services complete", async () => {
            const callOrder: string[] = [];

            jest.spyOn(
                FlockCasesByStateService.prototype,
                "createOrUpdateStateData"
            ).mockImplementation(async () => {
                callOrder.push("createOrUpdateStateData");
                return {} as any;
            });
            jest.spyOn(
                USSummaryService.prototype,
                "upsertUSSummary"
            ).mockImplementation(async () => {
                callOrder.push("upsertUSSummary");
                return {} as any;
            });
            jest.spyOn(
                SiteDetailsService.prototype,
                "upsertSiteDetails"
            ).mockImplementation(async () => {
                callOrder.push("upsertSiteDetails");
            });
            jest.spyOn(
                HistoricalSummaryService.prototype,
                "upsertHistoricalSummary"
            ).mockImplementation(async () => {
                callOrder.push("upsertHistoricalSummary");
            });
            jest.spyOn(
                StatusSummaryService.prototype,
                "upsertStatusSummary"
            ).mockImplementation(async () => {
                callOrder.push("upsertStatusSummary");
            });
            jest.spyOn(
                LastReportDateService.prototype,
                "updateLastReportDate"
            ).mockImplementation(async () => {
                callOrder.push("updateLastReportDate");
            });

            await service.applyUpdate(makeFlockData());

            // The 5 update services run in parallel, so only verify
            // updateLastReportDate is called last
            expect(callOrder[callOrder.length - 1]).toBe(
                "updateLastReportDate"
            );
            expect(callOrder.slice(0, 5)).toEqual(
                expect.arrayContaining([
                    "createOrUpdateStateData",
                    "upsertUSSummary",
                    "upsertSiteDetails",
                    "upsertHistoricalSummary",
                    "upsertStatusSummary",
                ])
            );
        });
    });
});
