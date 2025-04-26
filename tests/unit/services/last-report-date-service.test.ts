import { LastReportDateService } from "../../../src/services/model-services/last-report-date-service";
import { LastReportDateModel } from "../../../src/models/last-report-date-model";
import { Query } from "mongoose";

describe("LastReportDateService Unit Tests", () => {
    let lastReportDateService: LastReportDateService;

    beforeEach(() => {
        lastReportDateService = new LastReportDateService();
    });

    it("should create a model object with the correct fields when createOrUpdateLastReportDate is called", async () => {
        // Hardcode the system time to a fake date
        jest.useFakeTimers().setSystemTime(new Date("2025-04-02T12:00:00Z"));

        // Set fake a fake UUID to prevent crypto randomly generating a UUID
        jest.spyOn(global.crypto, "randomUUID").mockReturnValue(
            "mocked-uuid-for-testing-1234"
        );

        const findOneAndUpdateSpy = jest
            .spyOn(LastReportDateModel.getModel, "findOneAndUpdate")
            .mockResolvedValue(null);

        // Since we hardcoded the Date, UPDATE_FREQUENCY env, and the UUID, findOneAndUpdate should be called with this object
        const modelObj = {
            lastScrapedDate: new Date("2025-04-02T12:00:00Z"),
            authID: "mocked-uuid-for-testing-1234",
        };
        // Call the createOrUpdateLastReportDate function
        await lastReportDateService.createOrUpdateLastReportDate();

        // Spy on it to make sure it was called with the correct parameters
        expect(findOneAndUpdateSpy).toHaveBeenCalledWith({}, modelObj, {
            upsert: true,
        });

        // Restore the jest timers
        jest.useRealTimers();
    });
    it("should call findOne with authID and the property {$exists: true} when getAuthID is called", async () => {
        // Create our spy on the mongoose findOne function
        const findSpy = jest
            .spyOn(LastReportDateModel.getModel, "findOne")
            .mockReturnValue({
                select: jest.fn().mockResolvedValue({}),
            } as any);
        // Call get authID function
        await lastReportDateService.getAuthID();
        // We should be calling with a filter where authID exists
        expect(findSpy).toHaveBeenCalledWith({ authID: { $exists: true } });
        // Restore implementation
        findSpy.mockRestore();
    });
    it("should call select while hiding the _id, __v, lastScrapedDate elements when getAuthID is called", async () => {
        // Create our spy on the mongoose findOne function
        const selectSpy = jest
            .spyOn(LastReportDateModel.getModel, "findOne")
            .mockReturnValue({
                select: jest.fn().mockResolvedValue({}),
            } as any);
        // Call get authID function
        await lastReportDateService.getAuthID();
        // Expect that select was called while hiding id and version
        expect(selectSpy.mock.results[0].value.select).toHaveBeenCalledWith(
            "-_id -__v -lastScrapedDate"
        );
        // Restore implementation
        selectSpy.mockRestore();
    });
    it("should call findOne with lastScrapedDate and the property {$exists: true} when getLastScrapedDate is called", async () => {
        // Create our spy on the mongoose findOne function
        const findSpy = jest
            .spyOn(LastReportDateModel.getModel, "findOne")
            .mockReturnValue({
                select: jest.fn().mockResolvedValue({}),
            } as any);
        // Call get getLastScrapedDate
        await lastReportDateService.getLastScrapedDate();
        // Expect that find was called with the correct property
        expect(findSpy).toHaveBeenCalledWith({
            lastScrapedDate: { $exists: true },
        });
        // Restore implementation
        findSpy.mockRestore();
    });
    it("should call select while hiding the _id, __v, authID elements when getLastScrapedDate is called", async () => {
        // Create our spy on the mongoose findOne function
        const selectSpy = jest
            .spyOn(LastReportDateModel.getModel, "findOne")
            .mockReturnValue({
                select: jest.fn().mockResolvedValue({}),
            } as any);
        // Call get getLastScrapedDate function
        await lastReportDateService.getLastScrapedDate();
        // Expect that select was called while hiding id and version
        expect(selectSpy.mock.results[0].value.select).toHaveBeenCalledWith(
            "-_id -__v -authID"
        );
        // Restore implementation
        selectSpy.mockRestore();
    });
});
