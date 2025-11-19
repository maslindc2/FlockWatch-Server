import { LastReportDateService } from "../../../src/modules/last-report-date/last-report-date.service";
import { LastReportDateModel } from "../../../src/modules/last-report-date/last-report-date.model";

describe("LastReportDateService Unit Tests", () => {
    let lastReportDateService: LastReportDateService;

    beforeEach(() => {
        lastReportDateService = new LastReportDateService();
    });

    it("should call findOne with authID and the property {$exists: true} when getAuthID is called", async () => {
        const leanMock = jest.fn().mockResolvedValue({});
        const selectMock = jest.fn(() => ({ lean: leanMock }));

        // Create our spy on the mongoose findOne function
        const findSpy = jest
            .spyOn(LastReportDateModel.getModel, "findOne")
            .mockReturnValue({
                select: selectMock,
            } as any);

        // Call get authID function
        await lastReportDateService.getAuthID();

        // We should be calling with a filter where authID exists
        expect(findSpy).toHaveBeenCalledWith({ auth_id: { $exists: true } });

        // Expect .lean() to be called
        expect(leanMock).toHaveBeenCalled();

        // Restore implementation
        findSpy.mockRestore();
        leanMock.mockRestore();
        selectMock.mockRestore();
    });
    it("should call select while hiding the _id, __v, lastScrapedDate elements when getAuthID is called", async () => {
        const leanMock = jest.fn().mockResolvedValue({});
        const selectMock = jest.fn(() => ({ lean: leanMock }));
        // Create our spy on the mongoose findOne function
        const findOneMock = jest
            .spyOn(LastReportDateModel.getModel, "findOne")
            .mockReturnValue({
                select: selectMock,
            } as any);
        // Call get authID function
        await lastReportDateService.getAuthID();
        // Expect that select was called while hiding id and version
        expect(selectMock).toHaveBeenCalledWith("-_id -__v -last_scraped_date");

        // Expect .lean() to be called
        expect(leanMock).toHaveBeenCalled();

        // Restore implementation
        findOneMock.mockRestore();
        leanMock.mockRestore();
        selectMock.mockRestore();
    });
    it("should call findOne with lastScrapedDate and the property {$exists: true} when getLastScrapedDate is called", async () => {
        const leanMock = jest.fn().mockResolvedValue({});
        const selectMock = jest.fn(() => ({ lean: leanMock }));

        // Create our spy on the mongoose findOne function
        const findOneMock = jest
            .spyOn(LastReportDateModel.getModel, "findOne")
            .mockReturnValue({
                select: selectMock,
            } as any);

        // Call get getLastScrapedDate
        await lastReportDateService.getLastScrapedDate();
        // Expect that find was called with the correct property
        expect(findOneMock).toHaveBeenCalledWith({
            last_scraped_date: { $exists: true },
        });
        // Expect .lean() to be called
        expect(leanMock).toHaveBeenCalled();
        // Restore implementation
        findOneMock.mockRestore();
        leanMock.mockRestore();
        selectMock.mockRestore();
    });
    it("should call select while hiding the _id, __v, authID elements when getLastScrapedDate is called", async () => {
        const leanMock = jest.fn().mockResolvedValue({});
        const selectMock = jest.fn(() => ({ lean: leanMock }));

        // Create our spy on the mongoose findOne function
        const findOneMock = jest
            .spyOn(LastReportDateModel.getModel, "findOne")
            .mockReturnValue({ select: selectMock } as any);

        // Call get getLastScrapedDate function
        await lastReportDateService.getLastScrapedDate();
        // Expect that select was called while hiding id and version
        expect(selectMock).toHaveBeenCalledWith("-_id -__v -auth_id");

        // Expect .lean() to be called
        expect(leanMock).toHaveBeenCalled();

        // Restore implementation
        findOneMock.mockRestore();
        leanMock.mockRestore();
        selectMock.mockRestore();
    });
});
