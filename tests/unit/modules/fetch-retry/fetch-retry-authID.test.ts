import { FetchRetryAuthID } from "../../../../src/modules/fetch-retry/fetch-retry-authID";

// ---- Helpers ----------------------------------------------------------------

const makeMockResponse = (status = 200): Response =>
    ({ status, ok: status >= 200 && status < 300 }) as Response;

// ---- Tests ------------------------------------------------------------------

describe("FetchRetryAuthID", () => {
    let fetchRetryAuthID: FetchRetryAuthID;
    const TEST_AUTH_ID = "test-auth-token";

    beforeEach(() => {
        fetchRetryAuthID = new FetchRetryAuthID(TEST_AUTH_ID);
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    // -- buildHeaders ---------------------------------------------------------

    describe("buildHeaders", () => {
        it("should include the Authorization Bearer token", () => {
            // Access via postRetry call to inspect what fetch receives
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());

            fetchRetryAuthID.postRetry("https://example.com", {}, 0, 1000, 0);

            const calledWith = (fetchSpy.mock.calls[0] as any)[1];
            expect(calledWith.headers.Authorization).toBe(
                `Bearer ${TEST_AUTH_ID}`
            );
        });

        it("should include Content-Type application/json from the parent", () => {
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());

            fetchRetryAuthID.postRetry("https://example.com", {}, 0, 1000, 0);

            const calledWith = (fetchSpy.mock.calls[0] as any)[1];
            expect(calledWith.headers["Content-Type"]).toBe("application/json");
        });

        it("should include both Authorization and Content-Type headers together", () => {
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());

            fetchRetryAuthID.postRetry("https://example.com", {}, 0, 1000, 0);

            const calledWith = (fetchSpy.mock.calls[0] as any)[1];
            expect(calledWith.headers).toEqual({
                "Content-Type": "application/json",
                Authorization: `Bearer ${TEST_AUTH_ID}`,
            });
        });

        it("should use the authID passed to the constructor", () => {
            const customAuthID = "custom-token-123";
            const instance = new FetchRetryAuthID(customAuthID);
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());

            instance.postRetry("https://example.com", {}, 0, 1000, 0);

            const calledWith = (fetchSpy.mock.calls[0] as any)[1];
            expect(calledWith.headers.Authorization).toBe(
                `Bearer ${customAuthID}`
            );
        });

        it("should not include the parent authID when a different instance is created", () => {
            const instanceA = new FetchRetryAuthID("token-a");
            const instanceB = new FetchRetryAuthID("token-b");
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValue(makeMockResponse());

            instanceA.postRetry("https://example.com", {}, 0, 1000, 0);
            instanceB.postRetry("https://example.com", {}, 0, 1000, 0);

            const headersA = (fetchSpy.mock.calls[0] as any)[1].headers;
            const headersB = (fetchSpy.mock.calls[1] as any)[1].headers;
            expect(headersA.Authorization).toBe("Bearer token-a");
            expect(headersB.Authorization).toBe("Bearer token-b");
        });
    });

    // -- postRetry with auth --------------------------------------------------

    describe("postRetry", () => {
        it("should send Authorization header on a POST request", async () => {
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());

            await fetchRetryAuthID.postRetry(
                "https://example.com",
                { data: "test" },
                0,
                1000,
                0
            );

            const calledWith = (fetchSpy.mock.calls[0] as any)[1];
            expect(calledWith.headers.Authorization).toBe(
                `Bearer ${TEST_AUTH_ID}`
            );
        });

        it("should still return the response with auth headers", async () => {
            const mockResponse = makeMockResponse(200);
            jest.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse);

            const result = await fetchRetryAuthID.postRetry(
                "https://example.com",
                {},
                0,
                1000,
                0
            );

            expect(result).toBe(mockResponse);
        });
    });

    // -- getRetry with auth ---------------------------------------------------

    describe("getRetry", () => {
        it("should send Authorization header on a GET request", async () => {
            const fetchSpy = jest
                .spyOn(global, "fetch")
                .mockResolvedValueOnce(makeMockResponse());

            await fetchRetryAuthID.getRetry("https://example.com", 0, 1000, 0);

            const calledWith = (fetchSpy.mock.calls[0] as any)[1];
            expect(calledWith.headers.Authorization).toBe(
                `Bearer ${TEST_AUTH_ID}`
            );
        });

        it("should still return the response with auth headers", async () => {
            const mockResponse = makeMockResponse(200);
            jest.spyOn(global, "fetch").mockResolvedValueOnce(mockResponse);

            const result = await fetchRetryAuthID.getRetry(
                "https://example.com",
                0,
                1000,
                0
            );

            expect(result).toBe(mockResponse);
        });
    });
});
