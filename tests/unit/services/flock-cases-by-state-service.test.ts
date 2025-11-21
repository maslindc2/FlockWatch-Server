import { FlockCasesByStateService } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.service";
import { FlockCasesByStateModel } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.model";
import { FlockCasesByState } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.interface";
import { logger } from "../../../src/utils/winston-logger";

describe("FlockCasesByStateService", () => {
    // Use this variable for accessing the service
    let service: FlockCasesByStateService;

    beforeEach(() => {
        // Create a new service before each test
        service = new FlockCasesByStateService();
    });

    it("should call find and select with the parameters -_id and -__v when getAllFlockCases is called", async () => {
        const leanMock = jest.fn().mockResolvedValue([]);
        const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
        const findMock = jest.fn().mockReturnValue({ select: selectMock });

        const findSpy = jest
            .spyOn(FlockCasesByStateModel.getModel, "find")
            .mockImplementation(findMock);

        // Now call the service
        await service.getAllFlockCases();

        // Assertions
        expect(findMock).toHaveBeenCalledWith({});
        expect(selectMock).toHaveBeenCalledWith("-_id -__v");
        expect(leanMock).toHaveBeenCalled();

        // Clean up
        findSpy.mockRestore();
    });
    it("should call find and select with the parameters -_id and -__v when getStateFlockCase is called", async () => {
        const leanMock = jest.fn().mockResolvedValue({});
        const selectMock = jest.fn().mockReturnValue({ lean: leanMock });
        const findMock = jest.fn().mockReturnValue({ select: selectMock });

        const findSpy = jest
            .spyOn(FlockCasesByStateModel.getModel, "findOne")
            .mockImplementation(findMock);

        // Now call the service
        await service.getStateFlockCase("WA");

        // Assertions
        expect(findMock).toHaveBeenCalledWith({ state_abbreviation: "WA" });
        expect(selectMock).toHaveBeenCalledWith("-_id -__v");
        expect(leanMock).toHaveBeenCalled();

        // Clean up
        findSpy.mockRestore();
    });
    it("should throw and log an error when createOrUpdateStateData throws an error", async () => {
        // Create fake data with the expected type
        const mockData: FlockCasesByState[] = [
            {
                state_abbreviation: "PA",
                state: "Pennsylvania",
                backyard_flocks: 2344370,
                commercial_flocks: 7,
                birds_affected: 7,
                total_flocks: 390728,
                latitude: 40.99773861,
                longitude: -76.19300025,
                last_reported_detection: new Date(Date.UTC(2025, 2 - 1, 5)),
            },
        ];

        // Create our object to access the flock cases by state service
        const flockCasesByStateService = new FlockCasesByStateService();
        // Create a spy for winston logger and monitor the error function specifically
        const loggerErrorSpy = jest.spyOn(logger, "error");

        // Create a find and update spy and mock the implementation to throw an error
        const findOneAndUpdateSpy = jest
            .spyOn(FlockCasesByStateModel.getModel, "findOneAndUpdate")
            .mockImplementationOnce(
                () => Promise.reject(new Error("Mocked rejection")) as any
            );

        // Expect that we get our mock rejection back
        await expect(
            flockCasesByStateService.createOrUpdateStateData(mockData)
        ).rejects.toThrow(
            "Failed to update Model information resulted in Error: Mocked rejection"
        );
        // Logger should log an error with the expected message and mocked error
        expect(loggerErrorSpy).toHaveBeenCalledWith(
            "Failed to update data for Flock Cases By State: Error: Mocked rejection"
        );
        // Restore implementation
        findOneAndUpdateSpy.mockRestore();
    });
});
