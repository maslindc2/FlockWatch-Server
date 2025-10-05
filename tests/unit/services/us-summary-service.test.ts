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
        const selectMock = jest.fn().mockReturnThis();
        const leanMock = jest.fn().mockResolvedValue({});

        jest.spyOn(USSummaryModel.getModel, "findOne").mockReturnValue({
            select: selectMock,
            lean: leanMock,
        } as any);

        await usSummaryService.getUSSummary();

        expect(selectMock).toHaveBeenCalledWith("-_id -__v");
        expect(leanMock).toHaveBeenCalled();

        leanMock.mockRestore();
        selectMock.mockRestore();
    });

    it("should return expected mock data when getUSSummary is called", async () => {
        const fakeData: IUSSummaryStats = {
            key: "us-summary",
            allTimeTotals: {
                totalStatesAffected: 51,
                totalBirdsAffected: 168256658,
                totalFlocksAffected: 1676,
                totalBackyardFlocksAffected: 897,
                totalCommercialFlocksAffected: 779,
            },
            periodSummaries: [
                {
                    periodName: "last30Days",
                    totalBirdsAffected: 168256658,
                    totalFlocksAffected: 1676,
                    totalBackyardFlocksAffected: 897,
                    totalCommercialFlocksAffected: 779,
                },
            ],
        };

        const selectMock = jest.fn().mockReturnThis();
        const leanMock = jest.fn().mockResolvedValue(fakeData);

        jest.spyOn(USSummaryModel.getModel, "findOne").mockReturnValue({
            select: selectMock,
            lean: leanMock,
        } as any);

        const result = await usSummaryService.getUSSummary();
        expect(result).toEqual(fakeData);
        leanMock.mockRestore();
        selectMock.mockRestore();
    });
});
