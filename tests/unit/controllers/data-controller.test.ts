import { DataController } from "../../../src/controllers/data.controller";
import { FlockCasesByStateService } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.service";
import { LastReportDateService } from "../../../src/modules/last-report-date/last-report-date.service";
import { USSummaryService } from "../../../src/modules/us-summary/us-summary.service";
import { FlockDataUpdateService } from "../../../src/modules/data-updating/flock-data-update.service";
import { BuildUSSummary } from "../../../src/modules/data-updating/build-us-summary.service";
import { logger } from "../../../src/utils/winston-logger";
import { Request, Response } from "express";

// ---- Helpers ----------------------------------------------------------------

const mockRequest = (overrides: Partial<Request> = {}): Request =>
    ({
        url: "/test-url",
        params: {},
        headers: {},
        body: {},
        ip: "127.0.0.1",
        ...overrides,
    } as unknown as Request);

const mockResponse = (): Response => {
    const res = {} as Response;
    res.json = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    res.sendStatus = jest.fn().mockReturnValue(res);
    return res;
};

// ---- Tests ------------------------------------------------------------------

describe("DataController", () => {
    let controller: DataController;
    let req: Request;
    let res: Response;

    beforeEach(() => {
        controller = new DataController();
        res = mockResponse();
        jest.spyOn(logger, "http").mockImplementation(() => logger);
        jest.spyOn(logger, "error").mockImplementation(() => logger);
    });

    afterEach(() => jest.restoreAllMocks());

    // -- getAllFlockCases ------------------------------------------------------

    describe("getAllFlockCases", () => {
        it("should call getAllFlockCases on the service", async () => {
            const serviceSpy = jest
                .spyOn(FlockCasesByStateService.prototype, "getAllFlockCases")
                .mockResolvedValueOnce([]);
            req = mockRequest({ url: "/flock-cases" });

            await controller.getAllFlockCases(req, res);

            expect(serviceSpy).toHaveBeenCalledTimes(1);
        });

        it("should respond with the data from the service", async () => {
            const fakeData = [{ state: "PA", birds_affected: 100 }];
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "getAllFlockCases"
            ).mockResolvedValueOnce(fakeData as any);
            req = mockRequest({ url: "/flock-cases" });

            await controller.getAllFlockCases(req, res);

            expect(res.json).toHaveBeenCalledWith({ data: fakeData });
        });

        it("should log the request url", async () => {
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "getAllFlockCases"
            ).mockResolvedValueOnce([]);
            const logSpy = jest.spyOn(logger, "http").mockImplementation(() => logger);
            req = mockRequest({ url: "/flock-cases" });

            await controller.getAllFlockCases(req, res);

            expect(logSpy).toHaveBeenCalledWith(
                "Received Request at Get All Flock Cases By State: /flock-cases"
            );
        });

        it("should return 500 when the service throws", async () => {
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "getAllFlockCases"
            ).mockRejectedValueOnce(new Error("DB error"));
            req = mockRequest();

            await controller.getAllFlockCases(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: "Failed to fetch last report date",
            });
        });

        it("should log an error when the service throws", async () => {
            const error = new Error("DB error");
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "getAllFlockCases"
            ).mockRejectedValueOnce(error);
            const logSpy = jest.spyOn(logger, "error").mockImplementation(() => logger);
            req = mockRequest();

            await controller.getAllFlockCases(req, res);

            expect(logSpy).toHaveBeenCalledWith(
                "Error fetching Flock Cases By State date:",
                error
            );
        });
    });

    // -- getStateFlockCase ----------------------------------------------------

    describe("getStateFlockCase", () => {
        it("should call getStateFlockCase on the service with the state abbreviation", async () => {
            const serviceSpy = jest
                .spyOn(FlockCasesByStateService.prototype, "getStateFlockCase")
                .mockResolvedValueOnce({} as any);
            req = mockRequest({ url: "/flock-cases/WA", params: { stateAbbreviation: "WA" } });

            await controller.getStateFlockCase(req, res);

            expect(serviceSpy).toHaveBeenCalledWith("WA");
        });

        it("should respond with the data from the service", async () => {
            const fakeData = { state: "WA", birds_affected: 50 };
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "getStateFlockCase"
            ).mockResolvedValueOnce(fakeData as any);
            req = mockRequest({ url: "/flock-cases/WA", params: { stateAbbreviation: "WA" } });

            await controller.getStateFlockCase(req, res);

            expect(res.json).toHaveBeenCalledWith({ data: fakeData });
        });

        it("should log the request url", async () => {
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "getStateFlockCase"
            ).mockResolvedValueOnce({} as any);
            const logSpy = jest.spyOn(logger, "http").mockImplementation(() => logger);
            req = mockRequest({ url: "/flock-cases/WA", params: { stateAbbreviation: "WA" } });

            await controller.getStateFlockCase(req, res);

            expect(logSpy).toHaveBeenCalledWith(
                "Received Request at Get a State's Flock Case: /flock-cases/WA"
            );
        });

        it("should return 500 when the service throws", async () => {
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "getStateFlockCase"
            ).mockRejectedValueOnce(new Error("DB error"));
            req = mockRequest({ params: { stateAbbreviation: "WA" } });

            await controller.getStateFlockCase(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        it("should include the state abbreviation in the 500 error message", async () => {
            jest.spyOn(
                FlockCasesByStateService.prototype,
                "getStateFlockCase"
            ).mockRejectedValueOnce(new Error("DB error"));
            req = mockRequest({ params: { stateAbbreviation: "WA" } });

            await controller.getStateFlockCase(req, res);

            expect(res.json).toHaveBeenCalledWith({
                error: '"Failed to fetch requested state WA"',
            });
        });
    });

    // -- getUSSummary ---------------------------------------------------------

    describe("getUSSummary", () => {
        it("should call getFormattedUSSummary on the service", async () => {
            const serviceSpy = jest
                .spyOn(USSummaryService.prototype, "getFormattedUSSummary")
                .mockResolvedValueOnce({} as any);
            req = mockRequest({ url: "/us-summary" });

            await controller.getUSSummary(req, res);

            expect(serviceSpy).toHaveBeenCalledTimes(1);
        });

        it("should respond with the data from the service", async () => {
            const fakeData = { all_time_totals: {}, period_summaries: {} };
            jest.spyOn(
                USSummaryService.prototype,
                "getFormattedUSSummary"
            ).mockResolvedValueOnce(fakeData as any);
            req = mockRequest({ url: "/us-summary" });

            await controller.getUSSummary(req, res);

            expect(res.json).toHaveBeenCalledWith({ data: fakeData });
        });

        it("should return 404 when the service returns null", async () => {
            jest.spyOn(
                USSummaryService.prototype,
                "getFormattedUSSummary"
            ).mockResolvedValueOnce(null);
            req = mockRequest();

            await controller.getUSSummary(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: "No US summary found",
            });
        });

        it("should not log the request when summary is null", async () => {
            jest.spyOn(
                USSummaryService.prototype,
                "getFormattedUSSummary"
            ).mockResolvedValueOnce(null);
            const logSpy = jest.spyOn(logger, "http").mockImplementation(() => logger);
            req = mockRequest();

            await controller.getUSSummary(req, res);

            expect(logSpy).not.toHaveBeenCalled();
        });

        it("should log the request url on success", async () => {
            jest.spyOn(
                USSummaryService.prototype,
                "getFormattedUSSummary"
            ).mockResolvedValueOnce({} as any);
            const logSpy = jest.spyOn(logger, "http").mockImplementation(() => logger);
            req = mockRequest({ url: "/us-summary" });

            await controller.getUSSummary(req, res);

            expect(logSpy).toHaveBeenCalledWith(
                "Received Request at US Summary /us-summary"
            );
        });

        it("should return 500 when the service throws", async () => {
            jest.spyOn(
                USSummaryService.prototype,
                "getFormattedUSSummary"
            ).mockRejectedValueOnce(new Error("DB error"));
            req = mockRequest();

            await controller.getUSSummary(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: "Failed to US Summary!",
            });
        });
    });

    // -- getLastScrapedDate ---------------------------------------------------

    describe("getLastScrapedDate", () => {
        it("should call getLastScrapedDate on the service", async () => {
            const serviceSpy = jest
                .spyOn(LastReportDateService.prototype, "getLastScrapedDate")
                .mockResolvedValueOnce({} as any);
            req = mockRequest({ url: "/last-report-date" });

            await controller.getLastScrapedDate(req, res);

            expect(serviceSpy).toHaveBeenCalledTimes(1);
        });

        it("should respond with the data from the service", async () => {
            const fakeDate = { last_scraped_date: new Date("2024-01-01") };
            jest.spyOn(
                LastReportDateService.prototype,
                "getLastScrapedDate"
            ).mockResolvedValueOnce(fakeDate as any);
            req = mockRequest({ url: "/last-report-date" });

            await controller.getLastScrapedDate(req, res);

            expect(res.json).toHaveBeenCalledWith({ data: fakeDate });
        });

        it("should log the request url", async () => {
            jest.spyOn(
                LastReportDateService.prototype,
                "getLastScrapedDate"
            ).mockResolvedValueOnce({} as any);
            const logSpy = jest.spyOn(logger, "http").mockImplementation(() => logger);
            req = mockRequest({ url: "/last-report-date" });

            await controller.getLastScrapedDate(req, res);

            expect(logSpy).toHaveBeenCalledWith(
                "Received Request at Last Report Date /last-report-date"
            );
        });

        it("should return 500 when the service throws", async () => {
            jest.spyOn(
                LastReportDateService.prototype,
                "getLastScrapedDate"
            ).mockRejectedValueOnce(new Error("DB error"));
            req = mockRequest();

            await controller.getLastScrapedDate(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                error: "Failed to fetch last report date!",
            });
        });
    });

    // -- receiveUpdatedData ---------------------------------------------------

    describe("receiveUpdatedData", () => {
        const VALID_AUTH_ID = "valid-auth-id";

        const makeAuthReq = (authID: string | null, body = {}) =>
            mockRequest({
                headers: {
                    authorization: authID ? `Bearer ${authID}` : undefined,
                },
                body: {
                    flock_cases_by_state: [],
                    period_summaries: [],
                    ...body,
                },
                ip: "127.0.0.1",
            });

        beforeEach(() => {
            jest.spyOn(
                LastReportDateService.prototype,
                "getAuthID"
            ).mockResolvedValue({ auth_id: VALID_AUTH_ID } as any);
            jest.spyOn(
                BuildUSSummary.prototype,
                "createUSSummaryData"
            ).mockReturnValue({} as any);
            jest.spyOn(
                FlockDataUpdateService.prototype,
                "applyUpdate"
            ).mockResolvedValue({} as any);
        });

        it("should return 200 when the auth ID is valid", async () => {
            req = makeAuthReq(VALID_AUTH_ID);

            await controller.receiveUpdatedData(req, res);

            expect(res.sendStatus).toHaveBeenCalledWith(200);
        });

        it("should call applyUpdate when the auth ID is valid", async () => {
            const applyUpdateSpy = jest.spyOn(
                FlockDataUpdateService.prototype,
                "applyUpdate"
            ).mockResolvedValue({} as any);
            req = makeAuthReq(VALID_AUTH_ID);

            await controller.receiveUpdatedData(req, res);

            expect(applyUpdateSpy).toHaveBeenCalledTimes(1);
        });

        it("should pass flock_cases_by_state and us_summary_stats to applyUpdate", async () => {
            const flockData = [{ state: "PA" }];
            const applyUpdateSpy = jest.spyOn(
                FlockDataUpdateService.prototype,
                "applyUpdate"
            ).mockResolvedValue({} as any);
            req = makeAuthReq(VALID_AUTH_ID, { flock_cases_by_state: flockData });

            await controller.receiveUpdatedData(req, res);

            expect(applyUpdateSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    flock_cases_by_state: flockData,
                })
            );
        });

        it("should return 403 when the auth ID is invalid", async () => {
            req = makeAuthReq("wrong-token");

            await controller.receiveUpdatedData(req, res);

            expect(res.sendStatus).toHaveBeenCalledWith(403);
        });

        it("should log an error when the auth ID is invalid", async () => {
            const logSpy = jest.spyOn(logger, "error").mockImplementation(() => logger);
            req = makeAuthReq("wrong-token");

            await controller.receiveUpdatedData(req, res);

            expect(logSpy).toHaveBeenCalledWith(
                expect.stringContaining("Invalid Auth ID")
            );
        });

        it("should include the received auth ID in the error log", async () => {
            const logSpy = jest.spyOn(logger, "error").mockImplementation(() => logger);
            req = makeAuthReq("bad-token");

            await controller.receiveUpdatedData(req, res);

            expect(logSpy).toHaveBeenCalledWith(
                expect.stringContaining("bad-token")
            );
        });

        it("should not call applyUpdate when the auth ID is invalid", async () => {
            const applyUpdateSpy = jest.spyOn(
                FlockDataUpdateService.prototype,
                "applyUpdate"
            );
            req = makeAuthReq("wrong-token");

            await controller.receiveUpdatedData(req, res);

            expect(applyUpdateSpy).not.toHaveBeenCalled();
        });

        it("should return 403 when no authorization header is present", async () => {
            req = makeAuthReq(null);

            await controller.receiveUpdatedData(req, res);

            expect(res.sendStatus).toHaveBeenCalledWith(403);
        });

        it("should return 500 when an unexpected error is thrown", async () => {
            jest.spyOn(
                LastReportDateService.prototype,
                "getAuthID"
            ).mockRejectedValueOnce(new Error("Unexpected"));
            req = makeAuthReq(VALID_AUTH_ID);

            await controller.receiveUpdatedData(req, res);

            expect(res.sendStatus).toHaveBeenCalledWith(500);
        });
    });
});