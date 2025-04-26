import { USSummaryService } from "../../../src/services/model-services/us-summary-service";
import { USSummaryModel } from "../../../src/models/us-summary-model";

describe("USSummaryService Unit Tests", () => {
    let usSummaryService: USSummaryService;

    beforeEach(() => {
        usSummaryService = new USSummaryService();
    });

    it("should call find and select hiding the id and version when getUSSummary is called", async () => {
        // Use a spy to see what parameters find was called on the USSummaryModel
        const findSpy = jest
            .spyOn(USSummaryModel.getModel, "find")
            .mockReturnValue({
                select: jest.fn().mockResolvedValue([]),
            } as any);

        await usSummaryService.getUSSummary();

        // Find should be called with {} and the select should hide the internal ID and the version tag
        expect(findSpy).toHaveBeenCalledWith({});
        expect(findSpy.mock.results[0].value.select).toHaveBeenCalledWith(
            "-_id -__v"
        );

        findSpy.mockRestore();
    });

    it("should return expected mock data when getUSSummary is called", async () => {
        // Create fake state information
        const fakeData = [
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

        // When we call find return the mocked data
        jest.spyOn(USSummaryModel.getModel, "find").mockReturnValue({
            select: jest.fn().mockResolvedValue(fakeData),
        } as any);

        // When we call our service's getUSSummary we should get back our fakeData
        const result = await usSummaryService.getUSSummary();
        expect(result).toEqual(fakeData);
    });
});
