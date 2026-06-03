import { SiteDetailsService } from "../../../src/modules/site-details/site-details.service";
import { SiteDetailsModel } from "../../../src/modules/site-details/site-details.model";
import { SiteDetails } from "../../../src/modules/site-details/site-details.interface";
import { logger } from "../../../src/utils/winston-logger";

// ---- Factories --------------------------------------------------------------

const makeEntry = (overrides: Partial<SiteDetails> = {}): SiteDetails => ({
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

    // -- getAllSiteDetailsPaginated -------------------------------------------

    describe("getAllSiteDetailsPaginated", () => {
        const mockPaginatedQuery = (
            resolvedData: SiteDetails[],
            totalCount: number
        ) => {
            const leanMock = jest.fn().mockResolvedValue(resolvedData);
            const limitMock = jest.fn().mockReturnValue({ lean: leanMock });
            const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
            const selectMock = jest.fn().mockReturnValue({ skip: skipMock });
            jest.spyOn(SiteDetailsModel.getModel, "find").mockReturnValue({
                select: selectMock,
            } as any);
            jest.spyOn(
                SiteDetailsModel.getModel,
                "countDocuments"
            ).mockResolvedValue(totalCount);
            return { selectMock, skipMock, limitMock, leanMock };
        };

        it("should return paginated results with correct structure", async () => {
            const sites = [makeEntry(), makeEntry({ special_id: "Skagit 01" })];
            mockPaginatedQuery(sites, 50);

            const result = await service.getAllSiteDetailsPaginated(2, 10);

            expect(result).toEqual({
                data: sites,
                total: 50,
                page: 2,
                limit: 10,
                totalPages: 5,
            });
        });

        it("should calculate skip based on page and limit", async () => {
            mockPaginatedQuery([], 100);
            const { skipMock } = mockPaginatedQuery([], 100);

            await service.getAllSiteDetailsPaginated(3, 25);

            expect(skipMock).toHaveBeenCalledWith(50);
        });

        it("should apply limit correctly", async () => {
            const { limitMock } = mockPaginatedQuery([], 100);

            await service.getAllSiteDetailsPaginated(1, 50);

            expect(limitMock).toHaveBeenCalledWith(50);
        });

        it("should hide _id and __v fields", async () => {
            const { selectMock } = mockPaginatedQuery([], 0);

            await service.getAllSiteDetailsPaginated(1, 100);

            expect(selectMock).toHaveBeenCalledWith("-_id -__v");
        });

        it("should use default page=1 and limit=100 when not specified", async () => {
            const { skipMock, limitMock } = mockPaginatedQuery([], 0);

            await service.getAllSiteDetailsPaginated();

            expect(skipMock).toHaveBeenCalledWith(0);
            expect(limitMock).toHaveBeenCalledWith(100);
        });

        it("should return page 1 with default values when only limit is provided", async () => {
            const { skipMock } = mockPaginatedQuery([], 50);

            await service.getAllSiteDetailsPaginated(undefined, 20);

            expect(skipMock).toHaveBeenCalledWith(0);
        });

        it("should return totalPages of 0 when total is 0", async () => {
            mockPaginatedQuery([], 0);

            const result = await service.getAllSiteDetailsPaginated(1, 100);

            expect(result.totalPages).toBe(0);
        });

        it("should run find and countDocuments concurrently", async () => {
            const findSpy = jest
                .spyOn(SiteDetailsModel.getModel, "find")
                .mockReturnValue({
                    select: () => ({
                        skip: () => ({
                            limit: () => ({
                                lean: jest.fn().mockResolvedValue([]),
                            }),
                        }),
                    }),
                } as any);
            jest.spyOn(
                SiteDetailsModel.getModel,
                "countDocuments"
            ).mockResolvedValue(0);

            await service.getAllSiteDetailsPaginated(1, 100);

            expect(findSpy).toHaveBeenCalledTimes(1);
        });
    });

    // -- getSitesByStatusPaginated ---------------------------------------------

    describe("getSitesByStatusPaginated", () => {
        const mockPaginatedQuery = (
            resolvedData: SiteDetails[],
            totalCount: number
        ) => {
            const leanMock = jest.fn().mockResolvedValue(resolvedData);
            const limitMock = jest.fn().mockReturnValue({ lean: leanMock });
            const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
            const selectMock = jest.fn().mockReturnValue({ skip: skipMock });
            jest.spyOn(SiteDetailsModel.getModel, "find").mockReturnValue({
                select: selectMock,
            } as any);
            jest.spyOn(
                SiteDetailsModel.getModel,
                "countDocuments"
            ).mockResolvedValue(totalCount);
            return { selectMock, skipMock, limitMock, leanMock };
        };

        it("should filter by status", async () => {
            mockPaginatedQuery([], 0);

            await service.getSitesByStatusPaginated("released", 1, 10);

            expect(SiteDetailsModel.getModel.find).toHaveBeenCalledWith({
                status: "released",
            });
        });

        it("should normalize status to lowercase", async () => {
            mockPaginatedQuery([], 0);

            await service.getSitesByStatusPaginated("ACTIVE", 1, 10);

            expect(SiteDetailsModel.getModel.find).toHaveBeenCalledWith({
                status: "active",
            });
        });

        it("should return paginated results with correct structure", async () => {
            const sites = [makeEntry()];
            mockPaginatedQuery(sites, 30);

            const result = await service.getSitesByStatusPaginated(
                "active",
                3,
                10
            );

            expect(result).toEqual({
                data: sites,
                total: 30,
                page: 3,
                limit: 10,
                totalPages: 3,
            });
        });

        it("should hide _id and __v fields", async () => {
            const { selectMock } = mockPaginatedQuery([], 0);

            await service.getSitesByStatusPaginated("active", 1, 100);

            expect(selectMock).toHaveBeenCalledWith("-_id -__v");
        });
    });

    // -- getSitesByProductionTypePaginated --------------------------------------

    describe("getSitesByProductionTypePaginated", () => {
        const mockPaginatedQuery = (
            resolvedData: SiteDetails[],
            totalCount: number
        ) => {
            const leanMock = jest.fn().mockResolvedValue(resolvedData);
            const limitMock = jest.fn().mockReturnValue({ lean: leanMock });
            const skipMock = jest.fn().mockReturnValue({ limit: limitMock });
            const selectMock = jest.fn().mockReturnValue({ skip: skipMock });
            jest.spyOn(SiteDetailsModel.getModel, "find").mockReturnValue({
                select: selectMock,
            } as any);
            jest.spyOn(
                SiteDetailsModel.getModel,
                "countDocuments"
            ).mockResolvedValue(totalCount);
            return { selectMock, skipMock, limitMock, leanMock };
        };

        it("should use case-insensitive regex filter for production_type", async () => {
            mockPaginatedQuery([], 0);

            await service.getSitesByProductionTypePaginated(
                "Commercial Broiler Breeder",
                1,
                10
            );

            expect(
                SiteDetailsModel.getModel.find
            ).toHaveBeenCalledWith({
                production_type: {
                    $regex: expect.any(RegExp),
                },
            });
            const filter = (
                SiteDetailsModel.getModel.find as jest.Mock
            ).mock.calls[0][0];
            expect(filter.production_type.$regex.flags).toBe("i");
            expect(
                filter.production_type.$regex.test(
                    "Commercial Broiler Breeder"
                )
            ).toBe(true);
            expect(
                filter.production_type.$regex.test(
                    "commercial broiler breeder"
                )
            ).toBe(true);
        });

        it("should escape special regex characters in production type", async () => {
            mockPaginatedQuery([], 0);

            await service.getSitesByProductionTypePaginated(
                "Table Eggs (Layer)",
                1,
                10
            );

            const filter = (
                SiteDetailsModel.getModel.find as jest.Mock
            ).mock.calls[0][0];
            expect(
                filter.production_type.$regex.test("Table Eggs (Layer)")
            ).toBe(true);
            expect(
                filter.production_type.$regex.test("Table Eggs Layer")
            ).toBe(false);
        });

        it("should return paginated results with correct structure", async () => {
            const sites = [
                makeEntry({
                    special_id: "Elkhart 28",
                    production_type: "Commercial",
                }),
                makeEntry({
                    special_id: "Skagit 01",
                    production_type: "Commercial",
                }),
            ];
            mockPaginatedQuery(sites, 50);

            const result =
                await service.getSitesByProductionTypePaginated(
                    "Commercial",
                    2,
                    10
                );

            expect(result).toEqual({
                data: sites,
                total: 50,
                page: 2,
                limit: 10,
                totalPages: 5,
            });
        });

        it("should return empty data when no sites match", async () => {
            mockPaginatedQuery([], 0);

            const result =
                await service.getSitesByProductionTypePaginated(
                    "Nonexistent Type",
                    1,
                    100
                );

            expect(result.data).toEqual([]);
            expect(result.total).toBe(0);
            expect(result.totalPages).toBe(0);
        });

        it("should hide _id and __v fields", async () => {
            const { selectMock } = mockPaginatedQuery([], 0);

            await service.getSitesByProductionTypePaginated(
                "Test",
                1,
                100
            );

            expect(selectMock).toHaveBeenCalledWith("-_id -__v");
        });

        it("should use default page=1 and limit=100 when not specified", async () => {
            const { skipMock, limitMock } = mockPaginatedQuery([], 0);

            await service.getSitesByProductionTypePaginated("Test");

            expect(skipMock).toHaveBeenCalledWith(0);
            expect(limitMock).toHaveBeenCalledWith(100);
        });
    });

    // -- getDistinctProductionTypes --------------------------------------------

    describe("getDistinctProductionTypes", () => {
        const mockDistinct = (resolvedValue: string[]) => {
            const execMock = jest.fn().mockResolvedValue(resolvedValue);
            jest.spyOn(
                SiteDetailsModel.getModel,
                "distinct"
            ).mockReturnValue({ exec: execMock } as any);
            return execMock;
        };

        it("should call distinct on production_type field", async () => {
            mockDistinct([]);

            await service.getDistinctProductionTypes();

            expect(
                SiteDetailsModel.getModel.distinct
            ).toHaveBeenCalledWith("production_type");
        });

        it("should return distinct production types sorted alphabetically", async () => {
            mockDistinct([
                "Commercial Table Eggs",
                "Backyard Flock",
                "Commercial Broiler Breeder",
            ]);

            const result = await service.getDistinctProductionTypes();

            expect(result).toEqual([
                "Backyard Flock",
                "Commercial Broiler Breeder",
                "Commercial Table Eggs",
            ]);
        });

        it("should return an empty array when no sites exist", async () => {
            mockDistinct([]);

            const result = await service.getDistinctProductionTypes();

            expect(result).toEqual([]);
        });
    });

    // -- upsertSiteDetails - validation ---------------------------------------

    describe("upsertSiteDetails - validation", () => {
        it("should skip entries with an empty special_id", async () => {
            const bulkWriteSpy = jest
                .spyOn(SiteDetailsModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([makeEntry({ special_id: "" })]);

            expect(bulkWriteSpy).not.toHaveBeenCalled();
        });

        it("should skip entries with a non-string special_id", async () => {
            const bulkWriteSpy = jest
                .spyOn(SiteDetailsModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ special_id: undefined as any }),
            ]);

            expect(bulkWriteSpy).not.toHaveBeenCalled();
        });

        it("should log a warning when special_id is invalid", async () => {
            const warnSpy = jest
                .spyOn(logger, "warn")
                .mockImplementation(() => logger);

            jest.spyOn(
                SiteDetailsModel.getModel,
                "bulkWrite"
            ).mockResolvedValue({} as any);

            await service.upsertSiteDetails([makeEntry({ special_id: "" })]);

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid special_id")
            );
        });

        it("should skip entries with non-finite birds_affected", async () => {
            const bulkWriteSpy = jest
                .spyOn(SiteDetailsModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ birds_affected: NaN }),
            ]);

            expect(bulkWriteSpy).not.toHaveBeenCalled();
        });

        it("should skip entries with Infinity birds_affected", async () => {
            const bulkWriteSpy = jest
                .spyOn(SiteDetailsModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ birds_affected: Infinity }),
            ]);

            expect(bulkWriteSpy).not.toHaveBeenCalled();
        });

        it("should log a warning when birds_affected is invalid", async () => {
            const warnSpy = jest
                .spyOn(logger, "warn")
                .mockImplementation(() => logger);

            jest.spyOn(
                SiteDetailsModel.getModel,
                "bulkWrite"
            ).mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ birds_affected: NaN }),
            ]);

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid birds_affected")
            );
        });

        it("should skip entries with an invalid status", async () => {
            const bulkWriteSpy = jest
                .spyOn(SiteDetailsModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ status: "invalid_status" }),
            ]);

            expect(bulkWriteSpy).not.toHaveBeenCalled();
        });

        it("should skip entries with an empty status", async () => {
            const bulkWriteSpy = jest
                .spyOn(SiteDetailsModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([makeEntry({ status: "" })]);

            expect(bulkWriteSpy).not.toHaveBeenCalled();
        });

        it("should log a warning when status is invalid", async () => {
            const warnSpy = jest
                .spyOn(logger, "warn")
                .mockImplementation(() => logger);

            jest.spyOn(
                SiteDetailsModel.getModel,
                "bulkWrite"
            ).mockResolvedValue({} as any);

            await service.upsertSiteDetails([makeEntry({ status: "bogus" })]);

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid status")
            );
        });

        it("should accept status with different casing", async () => {
            const bulkWriteSpy = jest
                .spyOn(SiteDetailsModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([makeEntry({ status: "ACTIVE" })]);

            expect(bulkWriteSpy).toHaveBeenCalledTimes(1);
        });

        it("should process valid entries and skip invalid ones in the same array", async () => {
            const bulkWriteSpy = jest
                .spyOn(SiteDetailsModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ special_id: "Site 1" }),
                makeEntry({ special_id: "" }),
                makeEntry({ special_id: "Site 2" }),
            ]);

            expect(bulkWriteSpy).toHaveBeenCalledTimes(1);
            const operations = (bulkWriteSpy.mock.calls[0] as any)[0];
            expect(operations).toHaveLength(2);
        });
    });

    // -- upsertSiteDetails - query shape --------------------------------------

    describe("upsertSiteDetails - query shape", () => {
        it("should query by special_id", async () => {
            const bulkWriteSpy = jest
                .spyOn(SiteDetailsModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([makeEntry()]);

            const operations = (bulkWriteSpy.mock.calls[0] as any)[0];
            expect(operations[0].updateOne.filter).toEqual({
                special_id: "Elkhart 28",
            });
        });

        it("should call bulkWrite with upsert: true in each operation", async () => {
            const bulkWriteSpy = jest
                .spyOn(SiteDetailsModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([makeEntry()]);

            const operations = (bulkWriteSpy.mock.calls[0] as any)[0];
            expect(operations[0].updateOne.upsert).toBe(true);
        });

        it("should store status in lowercase", async () => {
            const bulkWriteSpy = jest
                .spyOn(SiteDetailsModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([makeEntry({ status: "ACTIVE" })]);

            const operations = (bulkWriteSpy.mock.calls[0] as any)[0];
            expect(operations[0].updateOne.update.$set.status).toBe("active");
        });

        it("should not call bulkWrite when siteData is empty", async () => {
            const bulkWriteSpy = jest
                .spyOn(SiteDetailsModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([]);

            expect(bulkWriteSpy).not.toHaveBeenCalled();
        });

        it("should batch all valid entries into a single bulkWrite call", async () => {
            const bulkWriteSpy = jest
                .spyOn(SiteDetailsModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.upsertSiteDetails([
                makeEntry({ special_id: "Site 1" }),
                makeEntry({ special_id: "Site 2" }),
                makeEntry({ special_id: "Site 3" }),
            ]);

            expect(bulkWriteSpy).toHaveBeenCalledTimes(1);
            const operations = (bulkWriteSpy.mock.calls[0] as any)[0];
            expect(operations).toHaveLength(3);
        });
    });

    // -- upsertSiteDetails - error handling -----------------------------------

    describe("upsertSiteDetails - error handling", () => {
        it("should log an error when bulkWrite throws", async () => {
            jest.spyOn(
                SiteDetailsModel.getModel,
                "bulkWrite"
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

        it("should throw when bulkWrite fails", async () => {
            jest.spyOn(
                SiteDetailsModel.getModel,
                "bulkWrite"
            ).mockRejectedValueOnce(new Error("DB error"));

            await expect(
                service.upsertSiteDetails([makeEntry()])
            ).rejects.toThrow("Failed to update site details");
        });
    });
});
