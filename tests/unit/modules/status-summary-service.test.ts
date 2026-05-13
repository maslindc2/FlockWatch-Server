import { StatusSummaryService } from "../../../src/modules/status-summary/status-summary.service";
import { StatusSummaryModel } from "../../../src/modules/status-summary/status-summary.model";
import { StatusSummary } from "../../../src/modules/status-summary/status-summary.interface";
import { logger } from "../../../src/utils/winston-logger";

// ---- Factories --------------------------------------------------------------

const makeEntry = (
    overrides: Partial<StatusSummary> = {}
): StatusSummary => ({
    key: "status-summary",
    sites_confirmed_last_30_days: 10,
    sites_released_last_30_days: 5,
    birds_affected_last_30_days: 100,
    ...overrides,
});

// Helper to mock the findOne().select().lean() chain
const mockFindOneChain = (resolvedValue: any) => {
    const leanMock = jest.fn().mockResolvedValue(resolvedValue);
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    jest.spyOn(StatusSummaryModel.getModel, "findOne").mockReturnValue({
        select: selectMock,
    } as any);
    return { selectMock, leanMock };
};

// ---- Tests ------------------------------------------------------------------

describe("StatusSummaryService", () => {
    let service: StatusSummaryService;

    beforeEach(() => {
        service = new StatusSummaryService();
    });

    afterEach(() => jest.restoreAllMocks());

    // -- getStatusSummary -----------------------------------------------------

    describe("getStatusSummary", () => {
        it("should query by key 'status-summary'", async () => {
            const findOneSpy = jest
                .spyOn(StatusSummaryModel.getModel, "findOne")
                .mockReturnValue({
                    select: () => ({
                        lean: () => Promise.resolve(null),
                    }),
                } as any);

            await service.getStatusSummary();

            expect(findOneSpy).toHaveBeenCalledWith({
                key: "status-summary",
            });
        });

        it("should return the status summary when found", async () => {
            const data = makeEntry();
            mockFindOneChain(data);

            const result = await service.getStatusSummary();

            expect(result).toEqual(data);
        });

        it("should return null when no document exists", async () => {
            mockFindOneChain(null);

            const result = await service.getStatusSummary();

            expect(result).toBeNull();
        });

        it("should hide _id, __v, and key fields", async () => {
            const { selectMock } = mockFindOneChain(makeEntry());
            await service.getStatusSummary();
            expect(selectMock).toHaveBeenCalledWith("-_id -__v -key");
        });
    });

    // -- upsertStatusSummary --------------------------------------------------

    describe("upsertStatusSummary", () => {
        it("should call findOneAndUpdate with key 'status-summary'", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(StatusSummaryModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertStatusSummary(makeEntry());

            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                { key: "status-summary" },
                expect.any(Object),
                expect.any(Object)
            );
        });

        it("should call findOneAndUpdate with upsert: true", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(StatusSummaryModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertStatusSummary(makeEntry());

            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                { upsert: true }
            );
        });

        it("should set key along with the sanitized data", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(StatusSummaryModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertStatusSummary(makeEntry());

            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                expect.any(Object),
                {
                    $set: {
                        key: "status-summary",
                        sites_confirmed_last_30_days: 10,
                        sites_released_last_30_days: 5,
                        birds_affected_last_30_days: 100,
                    },
                },
                expect.any(Object)
            );
        });

        it("should strip extra fields from the entry", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(StatusSummaryModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            const entryWithExtra = {
                ...makeEntry(),
                malicious_field: "injected",
            } as any;

            await service.upsertStatusSummary(entryWithExtra);

            const update = (findOneAndUpdateSpy.mock.calls[0] as any)[1];
            expect(update.$set).not.toHaveProperty("malicious_field");
        });

        it("should log an error when findOneAndUpdate throws", async () => {
            jest.spyOn(
                StatusSummaryModel.getModel,
                "findOneAndUpdate"
            ).mockRejectedValueOnce(new Error("DB error"));
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await expect(
                service.upsertStatusSummary(makeEntry())
            ).rejects.toThrow();

            expect(logSpy).toHaveBeenCalledWith(
                expect.stringContaining("Failed to update status summary")
            );
        });

        it("should throw when findOneAndUpdate fails", async () => {
            jest.spyOn(
                StatusSummaryModel.getModel,
                "findOneAndUpdate"
            ).mockRejectedValueOnce(new Error("DB error"));

            await expect(
                service.upsertStatusSummary(makeEntry())
            ).rejects.toThrow("Failed to update status summary");
        });
    });
});
