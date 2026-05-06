import { FetchRetry } from "../../../../src/modules/fetch-retry/fetch-retry";
import { logger } from "../../../../src/utils/winston-logger";

// Subclass to expose protected method for testing
class TestableFetchRetry extends FetchRetry {
    public exposedBuildHeaders(): Record<string, string> {
        return this.buildHeaders();
    }
}

// ---- Helpers ----------------------------------------------------------------

const makeMockResponse = (status = 200): Response =>
    ({ status, ok: status >= 200 && status < 300 } as Response);

// ---- Tests ------------------------------------------------------------------

describe("FetchRetry", () => {
    let fetchRetry: TestableFetchRetry;

    beforeEach(() => {
        fetchRetry = new TestableFetchRetry();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    // -- buildHeaders ---------------------------------------------------------

    describe("buildHeaders", () => {
        it("should return Content-Type application/json", () => {
            expect(fetchRetry.exposedBuildHeaders()).toEqual({
                "Content-Type": "application/json",
            });
        });
    });

    // -- postRetry ------------------------------------------------------------

    describe("postRetry", () => {
        it("should call fetch with the correct URL", async () => {
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());

            await fetchRetry.postRetry("https://example.com", {}, 0, 1000, 0);

            expect(fetchSpy).toHaveBeenCalledWith(
                "https://example.com",
                expect.any(Object)
            );
        });

        it("should call fetch with POST method", async () => {
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());

            await fetchRetry.postRetry("https://example.com", {}, 0, 1000, 0);

            expect(fetchSpy).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ method: "POST" })
            );
        });

        it("should call fetch with JSON stringified body", async () => {
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());
            const body = { key: "value" };

            await fetchRetry.postRetry("https://example.com", body, 0, 1000, 0);

            expect(fetchSpy).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ body: JSON.stringify(body) })
            );
        });

        it("should call fetch with the Content-Type header", async () => {
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());

            await fetchRetry.postRetry("https://example.com", {}, 0, 1000, 0);

            expect(fetchSpy).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: { "Content-Type": "application/json" },
                })
            );
        });

        it("should call fetch with an abort signal", async () => {
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());

            await fetchRetry.postRetry("https://example.com", {}, 0, 1000, 0);

            expect(fetchSpy).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ signal: expect.any(AbortSignal) })
            );
        });

        it("should return the response on success", async () => {
            const mockResponse = makeMockResponse(200);
            jest.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse);

            const result = await fetchRetry.postRetry(
                "https://example.com",
                {},
                0,
                1000,
                0
            );

            expect(result).toBe(mockResponse);
        });

        it("should return undefined when all retries are exhausted", async () => {
            jest.spyOn(global, "fetch").mockRejectedValue(
                new Error("Network error")
            );
            jest.spyOn(logger, "error").mockImplementation(() => logger);

            const promise = fetchRetry.postRetry(
                "https://example.com",
                {},
                0,
                1000,
                0
            );
            await jest.runAllTimersAsync();
            const result = await promise;

            expect(result).toBeUndefined();
        });

        it("should log an error when all retries are exhausted", async () => {
            jest.spyOn(global, "fetch").mockRejectedValue(
                new Error("Network error")
            );
            const loggerSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            const promise = fetchRetry.postRetry(
                "https://example.com",
                {},
                0,
                1000,
                0
            );
            await jest.runAllTimersAsync();
            await promise;

            expect(loggerSpy).toHaveBeenCalledWith(
                expect.stringContaining("Failed to make a post request")
            );
        });
    });

    // -- getRetry -------------------------------------------------------------

    describe("getRetry", () => {
        it("should call fetch with the correct URL", async () => {
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());

            await fetchRetry.getRetry("https://example.com", 0, 1000, 0);

            expect(fetchSpy).toHaveBeenCalledWith(
                "https://example.com",
                expect.any(Object)
            );
        });

        it("should call fetch with GET method", async () => {
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());

            await fetchRetry.getRetry("https://example.com", 0, 1000, 0);

            expect(fetchSpy).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({ method: "GET" })
            );
        });

        it("should not include a body in the GET request", async () => {
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());

            await fetchRetry.getRetry("https://example.com", 0, 1000, 0);

            const calledWith = (fetchSpy.mock.calls[0] as any)[1];
            expect(calledWith).not.toHaveProperty("body");
        });

        it("should return the response on success", async () => {
            const mockResponse = makeMockResponse(200);
            jest.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse);

            const result = await fetchRetry.getRetry(
                "https://example.com",
                0,
                1000,
                0
            );

            expect(result).toBe(mockResponse);
        });

        it("should return undefined when all retries are exhausted", async () => {
            jest.spyOn(global, "fetch").mockRejectedValue(
                new Error("Network error")
            );
            jest.spyOn(logger, "error").mockImplementation(() => logger);

            const promise = fetchRetry.getRetry(
                "https://example.com",
                0,
                1000,
                0
            );
            await jest.runAllTimersAsync();
            const result = await promise;

            expect(result).toBeUndefined();
        });

        it("should log an error when all retries are exhausted", async () => {
            jest.spyOn(global, "fetch").mockRejectedValue(
                new Error("Network error")
            );
            const loggerSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            const promise = fetchRetry.getRetry(
                "https://example.com",
                0,
                1000,
                0
            );
            await jest.runAllTimersAsync();
            await promise;

            expect(loggerSpy).toHaveBeenCalledWith(
                expect.stringContaining("Failed to make a post request")
            );
        });
    });

    // -- retry behavior -------------------------------------------------------

    describe("retry behavior", () => {
        it("should call fetch once when retries is 0 and it succeeds", async () => {
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());

            await fetchRetry.postRetry("https://example.com", {}, 0, 1000, 0);

            expect(fetchSpy).toHaveBeenCalledTimes(1);
        });

        it("should retry the specified number of times on failure", async () => {
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockRejectedValue(new Error("Network error"));
            jest.spyOn(logger, "error").mockImplementation(() => logger);

            // retries: 2 means 1 initial attempt + 2 retries = 3 total calls
            const promise = fetchRetry.postRetry(
                "https://example.com",
                {},
                2,
                1000,
                0
            );
            await jest.runAllTimersAsync();
            await promise;

            expect(fetchSpy).toHaveBeenCalledTimes(3);
        });

        it("should log a retry error on each failed attempt before the final one", async () => {
            jest.spyOn(global, "fetch").mockRejectedValue(
                new Error("Network error")
            );
            const loggerSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            const promise = fetchRetry.postRetry(
                "https://example.com",
                {},
                2,
                1000,
                0
            );
            await jest.runAllTimersAsync();
            await promise;

            // 2 retry log messages + 1 final postRetry failure log
            const retryCalls = loggerSpy.mock.calls.filter((call: any) =>
                (call[0] as string).includes("Network error contacting Server")
            );
            expect(retryCalls).toHaveLength(2);
        });

        it("should log the remaining retry count in each retry message", async () => {
            jest.spyOn(global, "fetch").mockRejectedValue(
                new Error("Network error")
            );
            const loggerSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            const promise = fetchRetry.postRetry(
                "https://example.com",
                {},
                2,
                1000,
                0
            );
            await jest.runAllTimersAsync();
            await promise;

            const retryCalls = loggerSpy.mock.calls.filter((call: any) =>
                (call[0] as string).includes("Network error contacting Server")
            );
            expect(retryCalls[0][0]).toContain("2");
            expect(retryCalls[1][0]).toContain("1");
        });

        it("should succeed without retrying if fetch succeeds on first attempt", async () => {
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());
            const loggerSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await fetchRetry.postRetry("https://example.com", {}, 3, 1000, 0);

            expect(fetchSpy).toHaveBeenCalledTimes(1);
            expect(loggerSpy).not.toHaveBeenCalled();
        });

        it("should succeed on a retry after initial failures", async () => {
            const mockResponse = makeMockResponse(200);
            jest.spyOn(global, "fetch")
                .mockRejectedValueOnce(new Error("Network error"))
                .mockRejectedValueOnce(new Error("Network error"))
                .mockResolvedValueOnce(mockResponse);
            jest.spyOn(logger, "error").mockImplementation(() => logger);

            const promise = fetchRetry.postRetry(
                "https://example.com",
                {},
                3,
                1000,
                0
            );
            await jest.runAllTimersAsync();
            const result = await promise;

            expect(result).toBe(mockResponse);
        });
    });
});