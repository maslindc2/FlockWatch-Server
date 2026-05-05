import { LastReportDateService } from "../../../src/modules/last-report-date/last-report-date.service";
import { LastReportDateModel } from "../../../src/modules/last-report-date/last-report-date.model";
import { logger } from "../../../src/utils/winston-logger";

// ---- Helpers ----------------------------------------------------------------

const mockFindOneChain = (resolvedValue: any) => {
    const leanMock = jest.fn().mockResolvedValue(resolvedValue);
    const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
    jest.spyOn(LastReportDateModel.getModel, "findOne").mockReturnValue({
        select: selectMock,
        lean: leanMock,
    } as any);
    return { selectMock, leanMock };
};

// ---- Tests ------------------------------------------------------------------

describe("LastReportDateService", () => {
    let service: LastReportDateService;

    beforeEach(() => {
        service = new LastReportDateService();
    });

    afterEach(() => jest.restoreAllMocks());

    // -- initializeLastReportDate ---------------------------------------------

    describe("initializeLastReportDate", () => {
        it("should return the existing record without creating a new one", async () => {
            const existingRecord = {
                last_scraped_date: new Date(),
                auth_id: "existing-uuid",
            };
            jest.spyOn(LastReportDateModel.getModel, "findOne").mockReturnValue({
                lean: jest.fn().mockResolvedValue(existingRecord),
            } as any);
            const createSpy = jest.spyOn(LastReportDateModel.getModel, "create");

            const result = await service.initializeLastReportDate();

            expect(result).toEqual(existingRecord);
            expect(createSpy).not.toHaveBeenCalled();
        });

        it("should create a new document when no record exists", async () => {
            jest.spyOn(LastReportDateModel.getModel, "findOne").mockReturnValue({
                lean: jest.fn().mockResolvedValue(null),
            } as any);
            const fakeDoc = { last_scraped_date: new Date(0), auth_id: "new-uuid" };
            jest.spyOn(LastReportDateModel.getModel, "create").mockResolvedValue({
                toObject: () => fakeDoc,
            } as any);

            const result = await service.initializeLastReportDate();

            expect(result).toEqual(fakeDoc);
        });

        it("should set last_scraped_date to Unix epoch when creating a new document", async () => {
            jest.spyOn(LastReportDateModel.getModel, "findOne").mockReturnValue({
                lean: jest.fn().mockResolvedValue(null),
            } as any);
            const createSpy = jest
                .spyOn(LastReportDateModel.getModel, "create")
                .mockResolvedValue({ toObject: () => ({}) } as any);

            await service.initializeLastReportDate();

            const calledWith = createSpy.mock.calls[0][0] as any;
            expect(calledWith.last_scraped_date).toEqual(new Date(0));
        });

        it("should generate a UUID for auth_id when creating a new document", async () => {
            jest.spyOn(LastReportDateModel.getModel, "findOne").mockReturnValue({
                lean: jest.fn().mockResolvedValue(null),
            } as any);
            const createSpy = jest
                .spyOn(LastReportDateModel.getModel, "create")
                .mockResolvedValue({ toObject: () => ({}) } as any);
            const uuidSpy = jest
                .spyOn(crypto, "randomUUID")
                .mockReturnValue("mocked-uuid" as any);

            await service.initializeLastReportDate();

            const calledWith = createSpy.mock.calls[0][0] as any;
            expect(uuidSpy).toHaveBeenCalled();
            expect(calledWith.auth_id).toBe("mocked-uuid");
        });

        it("should call toObject() on the newly created document", async () => {
            jest.spyOn(LastReportDateModel.getModel, "findOne").mockReturnValue({
                lean: jest.fn().mockResolvedValue(null),
            } as any);
            const toObjectMock = jest.fn().mockReturnValue({ auth_id: "new-uuid" });
            jest.spyOn(LastReportDateModel.getModel, "create").mockResolvedValue({
                toObject: toObjectMock,
            } as any);

            await service.initializeLastReportDate();

            expect(toObjectMock).toHaveBeenCalledTimes(1);
        });
    });

    // -- updateLastReportDate -------------------------------------------------

    describe("updateLastReportDate", () => {
        it("should include last_scraped_date in the update when isSuccessfulUpdate is true", async () => {
            const updateOneSpy = jest
                .spyOn(LastReportDateModel.getModel, "updateOne")
                .mockResolvedValue({} as any);

            await service.updateLastReportDate(true);

            const calledWith = (updateOneSpy.mock.calls[0] as any)[1];
            expect(calledWith).toHaveProperty("last_scraped_date");
            expect(calledWith.last_scraped_date).toBeInstanceOf(Date);
        });

        it("should not include last_scraped_date when isSuccessfulUpdate is false", async () => {
            const updateOneSpy = jest
                .spyOn(LastReportDateModel.getModel, "updateOne")
                .mockResolvedValue({} as any);

            await service.updateLastReportDate(false);

            const calledWith = (updateOneSpy.mock.calls[0] as any)[1];
            expect(calledWith).not.toHaveProperty("last_scraped_date");
        });

        it("should always generate a new auth_id regardless of isSuccessfulUpdate", async () => {
            const updateOneSpy = jest
                .spyOn(LastReportDateModel.getModel, "updateOne")
                .mockResolvedValue({} as any);
            jest.spyOn(crypto, "randomUUID").mockReturnValue("fresh-uuid" as any);

            await service.updateLastReportDate(true);
            expect((updateOneSpy.mock.calls[0] as any)[1].auth_id).toBe("fresh-uuid");

            updateOneSpy.mockClear();

            await service.updateLastReportDate(false);
            expect((updateOneSpy.mock.calls[0] as any)[1].auth_id).toBe("fresh-uuid");
        });

        it("should call updateOne with an empty filter", async () => {
            const updateOneSpy = jest
                .spyOn(LastReportDateModel.getModel, "updateOne")
                .mockResolvedValue({} as any);

            await service.updateLastReportDate(true);

            expect(updateOneSpy).toHaveBeenCalledWith({}, expect.any(Object));
        });

        it("should log an error and rethrow when updateOne throws", async () => {
            const dbError = new Error("DB write failed");
            jest.spyOn(LastReportDateModel.getModel, "updateOne").mockRejectedValue(dbError);
            const logSpy = jest.spyOn(logger, "error").mockImplementation(() => logger);

            await expect(service.updateLastReportDate(true)).rejects.toThrow(
                "Failed to update the last report date model!"
            );
            expect(logSpy).toHaveBeenCalledTimes(1);
        });

        it("should throw an Error instance when updateOne fails", async () => {
            jest.spyOn(LastReportDateModel.getModel, "updateOne").mockRejectedValue(
                new Error("DB write failed")
            );
            jest.spyOn(logger, "error").mockImplementation(() => logger);

            await expect(service.updateLastReportDate(false)).rejects.toBeInstanceOf(Error);
        });

        it("should include the isSuccessfulUpdate value in the error log message", async () => {
            jest.spyOn(LastReportDateModel.getModel, "updateOne").mockRejectedValue(
                new Error("oops")
            );
            const logSpy = jest.spyOn(logger, "error").mockImplementation(() => logger);

            await expect(service.updateLastReportDate(false)).rejects.toThrow();

            const logMessage = (logSpy.mock.calls[0] as any)[0] as unknown as string;
            expect(logMessage).toContain("false");
        });
        it("should return the result from getLastScrapedDate", async () => {
            const fakeDate = { last_scraped_date: new Date("2024-01-01") };
            mockFindOneChain(fakeDate);

            const result = await service.getLastScrapedDate();

            expect(result).toEqual(fakeDate);
        });

        it("should return the result from getAuthID", async () => {
            const fakeAuth = { auth_id: "some-uuid" };
            mockFindOneChain(fakeAuth);

            const result = await service.getAuthID();

            expect(result).toEqual(fakeAuth);
        });
    });
});