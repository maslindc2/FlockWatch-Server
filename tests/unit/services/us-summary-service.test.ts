import { USSummaryService } from "../../../src/services/model-services/us-summary-service";
import { USSummaryModel } from "../../../src/models/us-summary-model";
import { IUSSummaryStats } from "../../../src/interfaces/i-us-summary-stats";

describe("USSummaryService Unit Tests", () => {
    let usSummaryService: USSummaryService;

    beforeEach(() => {
        usSummaryService = new USSummaryService();
    });

    it("should call findOne and select hiding the id and version when getUSSummary is called", async () => {
        // Create a mock on the select function to see if it has been called with the correct parameters.
        const selectMock = jest.fn().mockResolvedValue({});

        // Use a spy to see what parameters find was called on the USSummaryModel
        const findSpy = jest
            .spyOn(USSummaryModel.getModel, "findOne")
            .mockReturnValue({
                select: selectMock
            } as any);
        
        await usSummaryService.getUSSummary();

        // Find should be called with {} and the select should hide the internal ID and the version tag
        expect(findSpy).toHaveBeenCalledWith({ totalStatesAffected: { $exists: true } });
        expect(selectMock).toHaveBeenCalledWith("-_id -__v");
        
        findSpy.mockRestore();
        selectMock.mockRestore();
    });

    it("should return expected mock data when getUSSummary is called", async () => {
        // Create fake state information
        const fakeData:IUSSummaryStats = {
            totalBackyardFlocksNationwide: 897,
            totalBirdsAffectedNationwide: 168256658,
            totalCommercialFlocksNationwide: 779,
            totalFlocksAffectedNationwide: 1676,
            totalStatesAffected: 51
        };

        // When we call find return the mocked data
        jest.spyOn(USSummaryModel.getModel, "findOne").mockReturnValue({
            select: jest.fn().mockResolvedValue(fakeData),
        } as any);

        // When we call our service's getUSSummary we should get back our fakeData
        const result = await usSummaryService.getUSSummary();
        expect(result).toEqual(fakeData);
    });
});
