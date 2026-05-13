import { HistoricalSummaryService } from "../../../src/modules/historical-summary/historical-summary.service";
import { HistoricalSummaryModel } from "../../../src/modules/historical-summary/historical-summary.model";
import { HistoricalSummary } from "../../../src/modules/historical-summary/historical-summary.interface";
import { logger } from "../../../src/utils/winston-logger";

// ---- Factories --------------------------------------------------------------

const makeEntry = (
    overrides: Partial<HistoricalSummary> = {}
): HistoricalSummary => ({
    key: "historical-summary",
    total_birds_affected_all_time: 1000,
    total_sites_all_time: 50,
    total_active_sites: 30,
    total_released_sites: 15,
    total_na_sites: 5,
    total_birds_active: 200,
    ...overrides,
});

// Helper to mock the findOne().select().lean() chain
const mockFindOneChain = (resolvedValue: any) => {
    const leanMock = jest.fn().mockResolvedValue(resolvedValue);
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    jest.spyOn(HistoricalSummaryModel.getModel, "findOne").mockReturnValue({
        select: selectMock,
    } as any);
    return { selectMock, leanMock };
};

// ---- Tests ------------------------------------------------------------------

describe("HistoricalSummaryService", () => {
    let service: HistoricalSummaryService;

    beforeEach(() => {
        service = new HistoricalSummaryService();
    });

    afterEach(() => jest.restoreAllMocks());

    // -- getHistoricalSummary -------------------------------------------------

    describe("getHistoricalSummary", () => {
        it("should query by key 'historical-summary'", async () => {
            const findOneSpy = jest
                .spyOn(HistoricalSummaryModel.getModel, "findOne")
                .mockReturnValue({
                    select: () => ({
                        lean: () => Promise.resolve(null),
                    }),
                } as any);

            await service.getHistoricalSummary();

            expect(findOneSpy).toHaveBeenCalledWith({
                key: "historical-summary",
            });
        });

        it("should return the historical summary when found", async () => {
            const data = makeEntry();
            mockFindOneChain(data);

            const result = await service.getHistoricalSummary();

            expect(result).toEqual(data);
        });

        it("should return null when no document exists", async () => {
            mockFindOneChain(null);

            const result = await service.getHistoricalSummary();

            expect(result).toBeNull();
        });

        it("should hide _id, __v, and key fields", async () => {
            const { selectMock } = mockFindOneChain(makeEntry());
            await service.getHistoricalSummary();
            expect(selectMock).toHaveBeenCalledWith("-_id -__v -key");
        });
    });

    // -- upsertHistoricalSummary ----------------------------------------------

    describe("upsertHistoricalSummary", () => {
        it("should call findOneAndUpdate with key 'historical-summary'", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(HistoricalSummaryModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertHistoricalSummary(makeEntry());

            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                { key: "historical-summary" },
                expect.any(Object),
                expect.any(Object)
            );
        });

        it("should call findOneAndUpdate with upsert: true", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(HistoricalSummaryModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertHistoricalSummary(makeEntry());

            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                { upsert: true }
            );
        });

        it("should set key along with the sanitized data", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(HistoricalSummaryModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertHistoricalSummary(makeEntry());

            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                expect.any(Object),
                {
                    $set: {
                        key: "historical-summary",
                        total_birds_affected_all_time: 1000,
                        total_sites_all_time: 50,
                        total_active_sites: 30,
                        total_released_sites: 15,
                        total_na_sites: 5,
                        total_birds_active: 200,
                    },
                },
                expect.any(Object)
            );
        });

        it("should strip extra fields from the entry", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(HistoricalSummaryModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            const entryWithExtra = {
                ...makeEntry(),
                malicious_field: "injected",
            } as any;

            await service.upsertHistoricalSummary(entryWithExtra);

            const update = (findOneAndUpdateSpy.mock.calls[0] as any)[1];
            expect(update.$set).not.toHaveProperty("malicious_field");
        });

        it("should log an error when findOneAndUpdate throws", async () => {
            jest.spyOn(
                HistoricalSummaryModel.getModel,
                "findOneAndUpdate"
            ).mockRejectedValueOnce(new Error("DB error"));
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await expect(
                service.upsertHistoricalSummary(makeEntry())
            ).rejects.toThrow();

            expect(logSpy).toHaveBeenCalledWith(
                expect.stringContaining("Failed to update historical summary")
            );
        });

        it("should throw when findOneAndUpdate fails", async () => {
            jest.spyOn(
                HistoricalSummaryModel.getModel,
                "findOneAndUpdate"
            ).mockRejectedValueOnce(new Error("DB error"));

            await expect(
                service.upsertHistoricalSummary(makeEntry())
            ).rejects.toThrow("Failed to update historical summary");
        });
    });
});
