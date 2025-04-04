import { USSummaryService } from "../../../src/services/model-services/us-summary-service";
import { USSummaryModel } from "../../../src/models/us-summary-model";

describe("USSummaryService Unit Tests", () => {
    let service: USSummaryService;

    beforeEach(() => {
        service = new USSummaryService();
    });

    it("should call find and select with the correct parameters", async () => {
        const findSpy = jest
            .spyOn(USSummaryModel.getModel, "find")
            .mockReturnValue({
                select: jest.fn().mockResolvedValue([]),
            } as any);

        await service.getUSSummary();

        expect(findSpy).toHaveBeenCalledWith({});
        expect(findSpy.mock.results[0].value.select).toHaveBeenCalledWith(
            "-_id -__v"
        );

        findSpy.mockRestore();
    });

    it("should return expected mock data", async () => {
        const mockData = [
            {
                stateAbbreviation: "PA",
                state: "Pennsylvania",
                backyardFlocks: 6,
                commercialFlocks: 2344370,
                birdsAffected: 7,
                totalFlocks: 7,
                latitude: 40.99773861,
                longitude: -76.19300025,
                lastReportedDate: new Date(Date.UTC(2025, 2 - 1, 5)),
            },
        ];

        jest.spyOn(USSummaryModel.getModel, "find").mockReturnValue({
            select: jest.fn().mockResolvedValue(mockData),
        } as any);

        const result = await service.getUSSummary();
        expect(result).toEqual(mockData);
    });
});
