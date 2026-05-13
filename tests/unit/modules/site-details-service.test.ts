import { SiteDetailsService } from "../../../src/modules/site-details/site-details.service";
import { SiteDetailsModel } from "../../../src/modules/site-details/site-details.model";
import { SiteDetails } from "../../../src/modules/site-details/site-details.interface";
import { logger } from "../../../src/utils/winston-logger";

// ---- Factories --------------------------------------------------------------

const makeEntry = (
    overrides: Partial<SiteDetails> = {}
): SiteDetails => ({
    special_id: "Elkhart 28",
    county: "Elkhart",
    state: "Indiana",
    production_type: "Commercial",
    confirmed_diagnosis_date: new Date("2024-01-01"),
    status: "active",
    birds_affected: 100,
    ...overrides,
});

// Helper to mock the find().select().lean() chain
const mockFindChain = (resolvedValue: any) => {
    const leanMock = jest.fn().mockResolvedValue(resolvedValue);
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    jest.spyOn(SiteDetailsModel.getModel, "find").mockReturnValue({
        select: selectMock,
    } as any);
    return { selectMock, leanMock };
};

// Helper to mock the findOne().select().lean() chain
const mockFindOneChain = (resolvedValue: any) => {
    const leanMock = jest.fn().mockResolvedValue(resolvedValue);
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    jest.spyOn(SiteDetailsModel.getModel, "findOne").mockReturnValue({
        select: selectMock,
    } as any);
    return { selectMock, leanMock };
};

// ---- Tests ------------------------------------------------------------------

describe("SiteDetailsService", () => {
    let service: SiteDetailsService;

    beforeEach(() => {
        service = new SiteDetailsService();
        jest.spyOn(logger, "warn").mockImplementation(() => logger);
        jest.spyOn(logger, "error").mockImplementation(() => logger);
    });

    afterEach(() => jest.restoreAllMocks());

    // -- getAllSiteDetails ----------------------------------------------------

    describe("getAllSiteDetails", () => {
        it("should return all site details", async () => {
            const sites = [makeEntry(), makeEntry({ special_id: "Skagit 01" })];
            mockFindChain(sites);

            const result = await service.getAllSiteDetails();

            expect(result).toEqual(sites);
        });

        it("should hide _id and __v fields", async () => {
            const { selectMock } = mockFindChain([]);
            await service.getAllSiteDetails();
            expect(selectMock).toHaveBeenCalledWith("-_id -__v");
        });

        it("should return an empty array when no sites exist", async () => {
            mockFindChain([]);
            const result = await service.getAllSiteDetails();
            expect(result).toEqual([]);
        });
    });

    // -- getSiteDetailById ----------------------------------------------------

    describe("getSiteDetailById", () => {
        it("should query by special_id", async () => {
            const findOneSpy = jest
                .spyOn(SiteDetailsModel.getModel, "findOne")
                .mockReturnValue({
                    select: () => ({ lean: () => Promise.resolve(null) }),
                } as any);

            await service.getSiteDetailById("Elkhart 28");

            expect(findOneSpy).toHaveBeenCalledWith({
                special_id: "Elkhart 28",
            });
        });

        it("should return the site when found", async () => {
            const site = makeEntry();
            mockFindOneChain(site);

            const result = await service.getSiteDetailById("Elkhart 28");

            expect(result).toEqual(site);
        });

        it("should return null when site is not found", async () => {
            mockFindOneChain(null);

            const result = await service.getSiteDetailById("NONEXISTENT");

            expect(result).toBeNull();
        });

        it("should hide _id and __v fields", async () => {
            const { selectMock } = mockFindOneChain(null);
            await service.getSiteDetailById("test");
            expect(selectMock).toHaveBeenCalledWith("-_id -__v");
        });
    });

    // -- getSitesByStatus -----------------------------------------------------

    describe("getSitesByStatus", () => {
        it("should query by status", async () => {
            jest.spyOn(SiteDetailsModel.getModel, "find").mockReturnValue({
                select: () => ({ lean: () => Promise.resolve([]) }),
            } as any);

            await service.getSitesByStatus("active");

            expect(SiteDetailsModel.getModel.find).toHaveBeenCalledWith({
                status: "active",
            });
        });

        it("should return sites matching the status", async () => {
            const sites = [makeEntry()];
            mockFindChain(sites);

            const result = await service.getSitesByStatus("active");

            expect(result).toEqual(sites);
        });

        it("should return an empty array when no sites match", async () => {
            mockFindChain([]);

            const result = await service.getSitesByStatus("released");

            expect(result).toEqual([]);
        });

        it("should hide _id and __v fields", async () => {
            const { selectMock } = mockFindChain([]);
            await service.getSitesByStatus("active");
            expect(selectMock).toHaveBeenCalledWith("-_id -__v");
        });
    });

    // -- upsertSiteDetails - validation ---------------------------------------

    describe("upsertSiteDetails - validation", () => {
        it("should skip entries with an empty special_id", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(SiteDetailsModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ special_id: "" }),
            ]);

            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it("should skip entries with a non-string special_id", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(SiteDetailsModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ special_id: undefined as any }),
            ]);

            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it("should log a warning when special_id is invalid", async () => {
            const warnSpy = jest
                .spyOn(logger, "warn")
                .mockImplementation(() => logger);

            jest.spyOn(
                SiteDetailsModel.getModel,
                "findOneAndUpdate"
            ).mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ special_id: "" }),
            ]);

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid special_id")
            );
        });

        it("should skip entries with non-finite birds_affected", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(SiteDetailsModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ birds_affected: NaN }),
            ]);

            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it("should skip entries with Infinity birds_affected", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(SiteDetailsModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ birds_affected: Infinity }),
            ]);

            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it("should log a warning when birds_affected is invalid", async () => {
            const warnSpy = jest
                .spyOn(logger, "warn")
                .mockImplementation(() => logger);

            jest.spyOn(
                SiteDetailsModel.getModel,
                "findOneAndUpdate"
            ).mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ birds_affected: NaN }),
            ]);

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid birds_affected")
            );
        });

        it("should skip entries with an invalid status", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(SiteDetailsModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ status: "invalid_status" }),
            ]);

            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it("should skip entries with an empty status", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(SiteDetailsModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ status: "" }),
            ]);

            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it("should log a warning when status is invalid", async () => {
            const warnSpy = jest
                .spyOn(logger, "warn")
                .mockImplementation(() => logger);

            jest.spyOn(
                SiteDetailsModel.getModel,
                "findOneAndUpdate"
            ).mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ status: "bogus" }),
            ]);

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid status")
            );
        });

        it("should accept status with different casing", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(SiteDetailsModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ status: "ACTIVE" }),
            ]);

            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
        });

        it("should process valid entries and skip invalid ones in the same array", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(SiteDetailsModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ special_id: "Site 1" }),
                makeEntry({ special_id: "" }),
                makeEntry({ special_id: "Site 2" }),
            ]);

            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(2);
        });
    });

    // -- upsertSiteDetails - query shape --------------------------------------

    describe("upsertSiteDetails - query shape", () => {
        it("should query by special_id", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(SiteDetailsModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([makeEntry()]);

            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                { special_id: "Elkhart 28" },
                expect.any(Object),
                expect.any(Object)
            );
        });

        it("should call findOneAndUpdate with upsert: true", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(SiteDetailsModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([makeEntry()]);

            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                { upsert: true }
            );
        });

        it("should store status in lowercase", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(SiteDetailsModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ status: "ACTIVE" }),
            ]);

            const update = (findOneAndUpdateSpy.mock.calls[0] as any)[1];
            expect(update.$set.status).toBe("active");
        });

        it("should not call findOneAndUpdate when siteData is empty", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(SiteDetailsModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([]);

            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it("should call findOneAndUpdate once per valid entry", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(SiteDetailsModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ special_id: "Site 1" }),
                makeEntry({ special_id: "Site 2" }),
                makeEntry({ special_id: "Site 3" }),
            ]);

            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(3);
        });
    });

    // -- upsertSiteDetails - error handling -----------------------------------

    describe("upsertSiteDetails - error handling", () => {
        it("should log an error when findOneAndUpdate throws", async () => {
            jest.spyOn(
                SiteDetailsModel.getModel,
                "findOneAndUpdate"
            ).mockRejectedValueOnce(new Error("DB error"));
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await expect(
                service.upsertSiteDetails([makeEntry()])
            ).rejects.toThrow();

            expect(logSpy).toHaveBeenCalledWith(
                expect.stringContaining("Failed to update site details")
            );
        });

        it("should throw when findOneAndUpdate fails", async () => {
            jest.spyOn(
                SiteDetailsModel.getModel,
                "findOneAndUpdate"
            ).mockRejectedValueOnce(new Error("DB error"));

            await expect(
                service.upsertSiteDetails([makeEntry()])
            ).rejects.toThrow("Failed to update site details");
        });
    });
});
