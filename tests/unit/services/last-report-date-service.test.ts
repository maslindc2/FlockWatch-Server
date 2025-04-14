import { LastReportDateService } from "../../../src/services/model-services/last-report-date-service";
import { LastReportDateModel } from "../../../src/models/last-report-date-model";
import { Query } from "mongoose";

describe("LastReportDateService Unit Tests", () => {
    let lastReportDateService: LastReportDateService;

    beforeEach(() => {
        lastReportDateService = new LastReportDateService();
    });

    it('should call findOne with correct filter and select with correct projection', async () => {
        jest.mock("../../../src/models/last-report-date-model");
        const fakeResult = { authID: "mocked-uuid-for-testing-1234" };
        const selectMock = jest.fn().mockResolvedValue(fakeResult);

        // Use a partial of the Mongoose Query type to avoid TS errors
        const mockedQuery = {
            select: selectMock,
        } as unknown as Query<any, any>;

        // Mock the getModel.findOne to return mockedQuery
        const findOneMock = jest.fn().mockReturnValue(mockedQuery);
        (LastReportDateModel.getModel as any).findOne = findOneMock;

        await lastReportDateService.getLastScrapedDate();

        expect(findOneMock).toHaveBeenCalledWith({ lastScrapedDate: { $exists: true } });
        expect(selectMock).toHaveBeenCalledWith('-_id -__v -authID');
    });
    it("createOrUpdateLastReportDate should be called with correct model object", async () => {
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
});
