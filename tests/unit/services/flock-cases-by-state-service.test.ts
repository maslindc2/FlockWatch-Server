import { FlockCasesByStateService } from "../../../src/services/model-services/flock-cases-by-state-service";
import { FlockCasesByStateModel } from "../../../src/models/flock-cases-by-state-model";

describe("FlockCasesByStateService", () => {
    let service: FlockCasesByStateService;

    beforeEach(() => {
        service = new FlockCasesByStateService();
    });

    it("should call find and select with the correct parameters", async () => {
        const findSpy = jest
            .spyOn(FlockCasesByStateModel.getModel, "find")
            .mockReturnValue({
                select: jest.fn().mockResolvedValue([]),
            } as any);

        await service.getAllFlockCases();

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

        jest.spyOn(FlockCasesByStateModel.getModel, "find").mockReturnValue({
            select: jest.fn().mockResolvedValue(mockData),
        } as any);

        const result = await service.getAllFlockCases();
        expect(result).toEqual(mockData);
    });
});
