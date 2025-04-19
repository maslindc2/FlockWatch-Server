import { FlockCasesByStateService } from "../../../src/services/model-services/flock-cases-by-state-service";
import { FlockCasesByStateModel } from "../../../src/models/flock-cases-by-state-model";
import { IFlockCasesByState } from "../../../src/interfaces/i-flock-cases-by-state";
import { logger } from "../../../src/utils/winston-logger";

describe("FlockCasesByStateService", () => {
    let service: FlockCasesByStateService;

    beforeEach(() => {
        service = new FlockCasesByStateService();
    });

    it("should call find and select with the parameters -_id and -__v when getAllFlockCases is called", async () => {
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
    
    it("should return expected mock data when getAllFlockCases is called", async () => {
        // Create some fake state data
        const mockData: IFlockCasesByState[] = [
            {
                stateAbbreviation: "PA",
                state: "Pennsylvania",
                backyardFlocks: 2344370,
                commercialFlocks: 7,
                birdsAffected: 7,
                totalFlocks: 390728,
                latitude: 40.99773861,
                longitude: -76.19300025,
                lastReportedDate: new Date(Date.UTC(2025, 2 - 1, 5)),
            },
        ];

        const findSpy = jest.spyOn(FlockCasesByStateModel.getModel, "find").mockReturnValue({
            select: jest.fn().mockResolvedValue(mockData),
        } as any);

        const result = await service.getAllFlockCases();
        expect(result).toEqual(mockData);
        
        findSpy.mockRestore();
    });
    it("should throw and log an error when createOrUpdateStateData throws an error", async () => {
        // Create fake data with the expected type
        const mockData: IFlockCasesByState[] = [
            {
                stateAbbreviation: "PA",
                state: "Pennsylvania",
                backyardFlocks: 2344370,
                commercialFlocks: 7,
                birdsAffected: 7,
                totalFlocks: 390728,
                latitude: 40.99773861,
                longitude: -76.19300025,
                lastReportedDate: new Date(Date.UTC(2025, 2 - 1, 5)),
            },
        ];
        // Create our object to access the flock cases by state service
        const flockCasesByStateService = new FlockCasesByStateService();
        // Create a spy for winston logger and monitor the error function specifically
        const loggerErrorSpy = jest.spyOn(logger, "error");
        // Create a find and update spy and mock the implementation to throw an erorr
        const findOneAndUpdateSpy = jest.spyOn(FlockCasesByStateModel.getModel, 'findOneAndUpdate')
        .mockImplementationOnce(() => Promise.reject(new Error('Mocked rejection')) as any);
        
        await expect(flockCasesByStateService.createOrUpdateStateData(mockData)).rejects.toThrow("Failed to update Model information resulted in Error: Mocked rejection");

        expect(findOneAndUpdateSpy).toHaveBeenCalledWith({state: mockData[0].state}, mockData[0], {upsert: true});

        expect(loggerErrorSpy).toHaveBeenCalledWith("Failed to update data for Flock Cases By State: Error: Mocked rejection");

        findOneAndUpdateSpy.mockRestore();
    });
});
