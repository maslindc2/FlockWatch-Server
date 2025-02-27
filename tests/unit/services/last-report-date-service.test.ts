import { LastReportDateService } from "../../../src/services/model-services/last-report-date-service";
import { LastReportDateModel } from "../../../src/models/last-report-date-model";

describe("FlockCasesByStateService", () => {
    let service: LastReportDateService;

    beforeEach(() => {
        service = new LastReportDateService();
    });

    it("should call find and select with the correct parameters", async () => {
        const findSpy = jest
            .spyOn(LastReportDateModel.getModel, "find")
            .mockReturnValue({
                select: jest.fn().mockResolvedValue([]),
            } as any);

        await service.getLastReportDate();

        expect(findSpy).toHaveBeenCalledWith({});
        expect(findSpy.mock.results[0].value.select).toHaveBeenCalledWith(
            "-_id -__v"
        );

        findSpy.mockRestore();
    });

    it("should return expected mock data", async () => {
        const mockData = [
            {
                state: "Pennsylvania",
                totalBirdsAffected: 6,
                totalFlocksAffected: 2344370,
                commercialFlocksAffected: 7,
                backyardFlocksAffected: 7,
                birdsPerFlock: 390728,
                lastReportedDate: new Date(Date.UTC(2025, 2 - 1, 5)),
                latitude: 40.99773861,
                longitude: -76.19300025,
            },
        ];

        jest.spyOn(LastReportDateModel.getModel, "find").mockReturnValue({
            select: jest.fn().mockResolvedValue(mockData),
        } as any);

        const result = await service.getLastReportDate();
        expect(result).toEqual(mockData);
    });
});
