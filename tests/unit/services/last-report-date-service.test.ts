import { LastReportDateService } from "../../../src/services/model-services/last-report-date-service";
import { LastReportDateModel } from "../../../src/models/last-report-date-model";

describe("FlockCasesByStateService", () => {
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
                authID: crypto.randomUUID
            },
        ];

        jest.spyOn(LastReportDateModel.getModel, "find").mockReturnValue({
            select: jest.fn().mockResolvedValue(mockData),
        } as any);

        const result = await service.getLastReportDate();
        expect(result).toEqual(mockData);
    });
});
