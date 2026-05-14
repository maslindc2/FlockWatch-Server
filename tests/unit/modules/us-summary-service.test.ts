import { USSummaryService } from "../../../src/modules/us-summary/us-summary.service";
import { USSummaryModel } from "../../../src/modules/us-summary/us-summary.model";
import {
    AllTimeTotals,
    PeriodSummary,
    USSummaryStats,
} from "../../../src/modules/us-summary/us-summary-stats.interface";

// ---- Factories --------------------------------------------------------------

const makeAllTimeTotals = (
    overrides: Partial<AllTimeTotals> = {}
): AllTimeTotals => ({
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

const makeUSSummaryStats = (
    overrides: Partial<USSummaryStats> = {}
): USSummaryStats => ({
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

    // -- upsertUSSummary ------------------------------------------------------

    describe("upsertUSSummary", () => {
        it("should perform a single findOneAndUpdate with both all_time_totals and period_summaries", async () => {
            const stats = makeUSSummaryStats();
            const findOneAndUpdateSpy = jest
                .spyOn(USSummaryModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);
            mockFindOneChain(stats);

            await service.upsertUSSummary(stats);

            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                { key: "us-summary" },
                {
                    $set: {
                        all_time_totals: stats.all_time_totals,
                        period_summaries: stats.period_summaries,
                    },
                },
                { upsert: true, new: true }
            );
        });

        it("should call getUSSummary after updating and return its result", async () => {
            const stats = makeUSSummaryStats();
            const finalDoc = makeUSSummaryStats({
                all_time_totals: makeAllTimeTotals({
                    total_states_affected: 99,
                }),
            });
            jest.spyOn(USSummaryModel.getModel, "findOneAndUpdate").mockResolvedValue(
                {} as any
            );
            const getSpy = jest
                .spyOn(service, "getUSSummary")
                .mockResolvedValue(finalDoc);

            const result = await service.upsertUSSummary(stats);

            expect(getSpy).toHaveBeenCalledTimes(1);
            expect(result).toEqual(finalDoc);
        });

        it("should call getUSSummary only after the findOneAndUpdate completes", async () => {
            const callOrder: string[] = [];
            const stats = makeUSSummaryStats();

            jest.spyOn(USSummaryModel.getModel, "findOneAndUpdate").mockImplementation(
                async () => {
                    callOrder.push("findOneAndUpdate");
                    return {} as any;
                }
            );
            jest.spyOn(service, "getUSSummary").mockImplementation(async () => {
                callOrder.push("getUSSummary");
                return makeUSSummaryStats();
            });

            await service.upsertUSSummary(stats);

            expect(callOrder).toEqual([
                "findOneAndUpdate",
                "getUSSummary",
            ]);
        });
    });
});
