import { LastReportDateService } from "../../../src/services/model-services/last-report-date-service";
import { LastReportDateModel } from "../../../src/models/last-report-date-model";

describe("LastReportDateService Unit Tests", () => {
    let service: LastReportDateService;

    beforeEach(() => {
        service = new LastReportDateService();
    });

    it("should call find and hide the internal id, version, and authID", async () => {
        const findSpy = jest
            .spyOn(LastReportDateModel.getModel, "find")
            .mockReturnValue({
                select: jest.fn().mockResolvedValue([]),
            } as any);

        await service.getLastReportDate();

        expect(findSpy).toHaveBeenCalledWith({});
        expect(findSpy.mock.results[0].value.select).toHaveBeenCalledWith(
            "-_id -__v -authID"
        );

        findSpy.mockRestore();
    });

    it("should return expected mock data", async () => {
        const mockData = [
            {
                lastScrapedDate: new Date(Date.UTC(2025, 2 - 1, 5)),
                updateFrequency: 24,
                authID: crypto.randomUUID,
            },
        ];

        jest.spyOn(LastReportDateModel.getModel, "find").mockReturnValue({
            select: jest.fn().mockResolvedValue(mockData),
        } as any);

        const result = await service.getLastReportDate();
        expect(result).toEqual(mockData);
    });

    it("should call find and only return the authID", async () => {
        const mockData = [
            {
                authID: "abfd0bc9-d631-4058-8723-a54b74435c38",
            },
        ];

        jest.spyOn(LastReportDateModel.getModel, "find").mockResolvedValue(
            mockData
        );

        const result = await service.getAuthID();
        expect(LastReportDateModel.getModel.find).toHaveBeenCalledWith({
            authID: { $exists: true },
        });
        expect(result).toEqual(mockData);
    });

    it("createOrUpdateLastReportDate should be called with correct model object", async () => {
        // Hardcode the system time to a fake date
        jest.useFakeTimers().setSystemTime(new Date("2025-04-02T12:00:00Z"));

        // Set the update frequency env variable to the default 24 value
        process.env.UPDATE_FREQUENCY = "24";

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
            updateFrequency: 24, // Ensure this matches the expected type
            authID: "mocked-uuid-for-testing-1234",
        };
        // Call the createOrUpdateLastReportDate function
        await service.createOrUpdateLastReportDate();

        // Spy on it to make sure it was called with the correct parameters
        expect(findOneAndUpdateSpy).toHaveBeenCalledWith({}, modelObj, {
            upsert: true,
        });

        // Restore the jest timers
        jest.useRealTimers();
    });
});
