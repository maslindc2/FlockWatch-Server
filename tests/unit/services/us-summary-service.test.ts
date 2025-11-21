import { USSummaryService } from "../../../src/modules/us-summary/us-summary.service";
import { USSummaryModel } from "../../../src/modules/us-summary/us-summary.model";
import { USSummaryStats } from "../../../src/modules/us-summary/us-summary-stats.interface";

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
        const fakeData: USSummaryStats = {
            key: "us-summary",
            all_time_totals: {
                total_states_affected: 51,
                total_birds_affected: 168256658,
                total_flocks_affected: 1676,
                total_backyard_flocks_affected: 897,
                total_commercial_flocks_affected: 779,
            },
            period_summaries: [
                {
                    period_name: "last_30_days",
                    total_birds_affected: 168256658,
                    total_flocks_affected: 1676,
                    total_backyard_flocks_affected: 897,
                    total_commercial_flocks_affected: 779,
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
