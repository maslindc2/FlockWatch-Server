import { USSummaryService } from "../../../src/modules/us-summary/us-summary.service";
import { USSummaryModel } from "../../../src/modules/us-summary/us-summary.model";
import {
    AllTimeTotals,
    PeriodSummary,
    USSummaryStats,
} from "../../../src/modules/us-summary/us-summary-stats.interface";

// ---- Factories --------------------------------------------------------------

const makeAllTimeTotals = (overrides: Partial<AllTimeTotals> = {}): AllTimeTotals => ({
    total_states_affected: 20,
    total_birds_affected: 500,
    total_flocks_affected: 50,
    total_backyard_flocks_affected: 15,
    total_commercial_flocks_affected: 35,
    ...overrides,
});

const makePeriod = (overrides: Partial<PeriodSummary> = {}): PeriodSummary => ({
    period_name: "last_30_days",
    total_birds_affected: 100,
    total_flocks_affected: 10,
    total_backyard_flocks_affected: 3,
    total_commercial_flocks_affected: 7,
    ...overrides,
});

const makeUSSummaryStats = (overrides: Partial<USSummaryStats> = {}): USSummaryStats => ({
    key: "us-summary",
    all_time_totals: makeAllTimeTotals(),
    period_summaries: [makePeriod()],
    ...overrides,
});

// Helper to mock the findOne().select().lean() chain
const mockFindOneChain = (resolvedValue: any) => {
    const leanMock = jest.fn().mockResolvedValue(resolvedValue);
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    jest.spyOn(USSummaryModel.getModel, "findOne").mockReturnValue({
        select: selectMock,
    } as any);
    return { selectMock, leanMock };
};

// ---- Tests ------------------------------------------------------------------

describe("USSummaryService", () => {
    let service: USSummaryService;

    beforeEach(() => {
        service = new USSummaryService();
    });

    afterEach(() => jest.restoreAllMocks());

    // -- getFormattedUSSummary ------------------------------------------------

    describe("getFormattedUSSummary", () => {
        it("should return null when no document exists", async () => {
            mockFindOneChain(null);
            const result = await service.getFormattedUSSummary();
            expect(result).toBeNull();
        });

        it("should return all_time_totals unchanged", async () => {
            const stats = makeUSSummaryStats();
            mockFindOneChain(stats);
            const result = await service.getFormattedUSSummary();
            expect(result?.all_time_totals).toEqual(stats.all_time_totals);
        });

        it("should pass period_summaries through USSummaryModel.formatPeriods", async () => {
            const stats = makeUSSummaryStats();
            const formatted = { last_30_days: makePeriod() };
            mockFindOneChain(stats);
            const formatSpy = jest
                .spyOn(USSummaryModel, "formatPeriods")
                .mockReturnValue(formatted);

            const result = await service.getFormattedUSSummary();

            expect(formatSpy).toHaveBeenCalledWith(stats.period_summaries);
            expect(result?.period_summaries).toEqual(formatted);
        });

        it("should hide _id and __v fields", async () => {
            const { selectMock } = mockFindOneChain(makeUSSummaryStats());
            await service.getFormattedUSSummary();
            expect(selectMock).toHaveBeenCalledWith("-_id -__v");
        });

        it("should return the correct shape", async () => {
            const stats = makeUSSummaryStats();
            mockFindOneChain(stats);
            jest.spyOn(USSummaryModel, "formatPeriods").mockReturnValue({});

            const result = await service.getFormattedUSSummary();

            expect(result).toHaveProperty("all_time_totals");
            expect(result).toHaveProperty("period_summaries");
            expect(result).not.toHaveProperty("key");
        });
    });

    // -- updateAllTimeTotals --------------------------------------------------

    describe("updateAllTimeTotals", () => {
        it("should delegate to USSummaryModel.updateAllTimeTotals", async () => {
            const totals = makeAllTimeTotals();
            const modelSpy = jest
                .spyOn(USSummaryModel, "updateAllTimeTotals")
                .mockResolvedValue({} as any);

            await service.updateAllTimeTotals(totals);

            expect(modelSpy).toHaveBeenCalledTimes(1);
            expect(modelSpy).toHaveBeenCalledWith(totals);
        });

        it("should return the result from USSummaryModel.updateAllTimeTotals", async () => {
            const expected = makeUSSummaryStats();
            jest.spyOn(USSummaryModel, "updateAllTimeTotals").mockResolvedValue(
                expected as any
            );

            const result = await service.updateAllTimeTotals(makeAllTimeTotals());
            expect(result).toEqual(expected);
        });
    });

    // -- upsertPeriodSummary --------------------------------------------------

    describe("upsertPeriodSummary", () => {
        it("should delegate to USSummaryModel.upsertPeriodAtomic", async () => {
            const period = makePeriod();
            const modelSpy = jest
                .spyOn(USSummaryModel, "upsertPeriodAtomic")
                .mockResolvedValue({} as any);

            await service.upsertPeriodSummary(period);

            expect(modelSpy).toHaveBeenCalledTimes(1);
            expect(modelSpy).toHaveBeenCalledWith(period);
        });

        it("should return the result from USSummaryModel.upsertPeriodAtomic", async () => {
            const expected = makeUSSummaryStats();
            jest.spyOn(USSummaryModel, "upsertPeriodAtomic").mockResolvedValue(
                expected as any
            );

            const result = await service.upsertPeriodSummary(makePeriod());
            expect(result).toEqual(expected);
        });
    });

    // -- upsertUSSummary ------------------------------------------------------

    describe("upsertUSSummary", () => {
        it("should call updateAllTimeTotals once with all_time_totals", async () => {
            const stats = makeUSSummaryStats();
            const updateSpy = jest
                .spyOn(service, "updateAllTimeTotals")
                .mockResolvedValue({} as any);
            jest.spyOn(service, "upsertPeriodSummary").mockResolvedValue({} as any);
            mockFindOneChain(stats);

            await service.upsertUSSummary(stats);

            expect(updateSpy).toHaveBeenCalledTimes(1);
            expect(updateSpy).toHaveBeenCalledWith(stats.all_time_totals);
        });

        it("should call upsertPeriodSummary once per period", async () => {
            const periods = [makePeriod({ period_name: "last_30_days" }), makePeriod({ period_name: "last_60_days" })];
            const stats = makeUSSummaryStats({ period_summaries: periods });
            jest.spyOn(service, "updateAllTimeTotals").mockResolvedValue({} as any);
            const periodSpy = jest
                .spyOn(service, "upsertPeriodSummary")
                .mockResolvedValue({} as any);
            mockFindOneChain(stats);

            await service.upsertUSSummary(stats);

            expect(periodSpy).toHaveBeenCalledTimes(2);
            expect(periodSpy).toHaveBeenNthCalledWith(1, periods[0]);
            expect(periodSpy).toHaveBeenNthCalledWith(2, periods[1]);
        });

        it("should not call upsertPeriodSummary when period_summaries is empty", async () => {
            const stats = makeUSSummaryStats({ period_summaries: [] });
            jest.spyOn(service, "updateAllTimeTotals").mockResolvedValue({} as any);
            const periodSpy = jest
                .spyOn(service, "upsertPeriodSummary")
                .mockResolvedValue({} as any);
            mockFindOneChain(stats);

            await service.upsertUSSummary(stats);

            expect(periodSpy).not.toHaveBeenCalled();
        });

        it("should call getUSSummary after all updates and return its result", async () => {
            const stats = makeUSSummaryStats();
            const finalDoc = makeUSSummaryStats({ all_time_totals: makeAllTimeTotals({ total_states_affected: 99 }) });
            jest.spyOn(service, "updateAllTimeTotals").mockResolvedValue({} as any);
            jest.spyOn(service, "upsertPeriodSummary").mockResolvedValue({} as any);
            const getSpy = jest.spyOn(service, "getUSSummary").mockResolvedValue(finalDoc);

            const result = await service.upsertUSSummary(stats);

            expect(getSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual(finalDoc);
        });

        it("should call getUSSummary after all period upserts, not before", async () => {
            const callOrder: string[] = [];
            const stats = makeUSSummaryStats({ period_summaries: [makePeriod()] });

            jest.spyOn(service, "updateAllTimeTotals").mockImplementation(async () => {
                callOrder.push("updateAllTimeTotals");
                return {} as any;
            });
            jest.spyOn(service, "upsertPeriodSummary").mockImplementation(async () => {
                callOrder.push("upsertPeriodSummary");
                return {} as any;
            });
            jest.spyOn(service, "getUSSummary").mockImplementation(async () => {
                callOrder.push("getUSSummary");
                return makeUSSummaryStats();
            });

            await service.upsertUSSummary(stats);

            expect(callOrder).toEqual(["updateAllTimeTotals", "upsertPeriodSummary", "getUSSummary"]);
        });
    });
});