import { FlockCasesByStateModel } from "../../src/models/flock-cases-by-state-model";
import { USSummaryModel } from "../../src/models/us-summary-model";
import { LastReportDateModel } from "../../src/models/last-report-date-model";
import { FlockCasesByStateService } from "../../src/services/model-services/flock-cases-by-state-service";
import { USSummaryService } from "../../src/services/model-services/us-summary-service";
import { LastReportDateService } from "../../src/services/model-services/last-report-date-service";
import { DataController } from "../../src/controllers/data-controller";
import { Request, Response } from "express";

describe("DataController", () => {
    let dataController: DataController;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let statusMock: jest.Mock;
    let jsonMock: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        dataController = new DataController();
        req = {};
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        res = {
            status: statusMock,
            json: jsonMock,
        };
    });

    it("should return all flock cases successfully", async () => {
        const mockData = [
            FlockCasesByStateModel.getModel.hydrate({
                state: "Pennsylvania",
                totalBirdsAffected: 6,
                totalFlocksAffected: 2344370,
                commercialFlocksAffected: 7,
                backyardFlocksAffected: 7,
                birdsPerFlock: 390728,
                lastReportedDate: new Date(Date.UTC(2025, 1, 5)),
                latitude: 40.99773861,
                longitude: -76.19300025,
            }),
        ];

        jest.spyOn(
            FlockCasesByStateService.prototype,
            "getAllFlockCases"
        ).mockResolvedValue(mockData);
        await dataController.getAllFlockCases(req as Request, res as Response);
        expect(
            FlockCasesByStateService.prototype.getAllFlockCases
        ).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
        expect(jsonMock).toHaveBeenCalledWith(mockData);
    });

    it("should handle errors when fetching flock cases", async () => {
        jest.spyOn(
            FlockCasesByStateService.prototype,
            "getAllFlockCases"
        ).mockRejectedValue(new Error("DB error"));
        await dataController.getAllFlockCases(req as Request, res as Response);
        expect(
            FlockCasesByStateService.prototype.getAllFlockCases
        ).toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            error: "Failed to fetch last report date",
        });
    });

    it("should return US summary successfully", async () => {
        const mockData = [
            USSummaryModel.getModel.hydrate({
                totalStatesAffected: 29,
                totalBirdsAffectedNationwide: 24260704,
                totalFlocksAffectedNationwide: 159,
                totalBackyardFlocksNationwide: 49,
                totalCommercialFlocksNationwide: 110,
            }),
        ];
        jest.spyOn(
            USSummaryService.prototype,
            "getUSSummary"
        ).mockResolvedValue(mockData);
        await dataController.getUSSummary(req as Request, res as Response);
        expect(USSummaryService.prototype.getUSSummary).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled(); // Default 200
        expect(jsonMock).toHaveBeenCalledWith(mockData);
    });

    it("should handle errors when fetching US summary", async () => {
        jest.spyOn(
            USSummaryService.prototype,
            "getUSSummary"
        ).mockRejectedValue(new Error("DB error"));
        await dataController.getUSSummary(req as Request, res as Response);
        expect(USSummaryService.prototype.getUSSummary).toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            error: "Failed to US Summary!",
        });
    });

    it("should return last report date successfully", async () => {
        const mockData = [
            LastReportDateModel.getModel.hydrate({
                lastScrapedDate: {
                    $date: "2025-02-16T00:00:00.000Z",
                },
                currentUpdateTime: {
                    $date: "2025-02-12T08:00:00.000Z",
                },
            }),
        ];
        jest.spyOn(
            LastReportDateService.prototype,
            "getLastReportDate"
        ).mockResolvedValue(mockData);
        await dataController.getLastReportDate(req as Request, res as Response);
        expect(
            LastReportDateService.prototype.getLastReportDate
        ).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
        expect(jsonMock).toHaveBeenCalledWith(mockData);
    });

    it("should handle errors when fetching last report date", async () => {
        jest.spyOn(
            LastReportDateService.prototype,
            "getLastReportDate"
        ).mockRejectedValue(new Error("DB error"));
        await dataController.getLastReportDate(req as Request, res as Response);
        expect(
            LastReportDateService.prototype.getLastReportDate
        ).toHaveBeenCalled();
        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({
            error: "Failed to fetch last report date!",
        });
    });
});
