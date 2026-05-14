import { FlockCasesByStateService } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.service";
import { FlockCasesByStateModel } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.model";
import { FlockCasesByState } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.interface";
import { logger } from "../../../src/utils/winston-logger";

// ---- Factories --------------------------------------------------------------

const makeEntry = (
    overrides: Partial<FlockCasesByState> = {}
): FlockCasesByState => ({
    state_abbreviation: "PA",
    state: "Pennsylvania",
    birds_affected: 100,
    total_flocks: 10,
    backyard_flocks: 3,
    commercial_flocks: 7,
    latitude: 40.99,
    longitude: -76.19,
    last_reported_detection: new Date("2024-01-01"),
    ...overrides,
});

// ---- Tests ------------------------------------------------------------------

describe("FlockCasesByStateService", () => {
    let service: FlockCasesByStateService;

    beforeEach(() => {
        service = new FlockCasesByStateService();
        jest.spyOn(logger, "error").mockImplementation(() => logger);
        jest.spyOn(logger, "warn").mockImplementation(() => logger);
    });

    afterEach(() => jest.restoreAllMocks());

    // -- createOrUpdateStateData - validation ---------------------------------

    describe("createOrUpdateStateData - input validation", () => {
        it("should skip entries with an invalid state_abbreviation", async () => {
            const bulkWriteSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ state_abbreviation: "INVALID" }),
            ]);

            expect(bulkWriteSpy).not.toHaveBeenCalled();
        });

        it("should log a warning when state_abbreviation is invalid", async () => {
            jest.spyOn(
                FlockCasesByStateModel.getModel,
                "bulkWrite"
            ).mockResolvedValue({} as any);
            const warnSpy = jest
                .spyOn(logger, "warn")
                .mockImplementation(() => logger);

            await service.createOrUpdateStateData([
                makeEntry({ state_abbreviation: "INVALID" }),
            ]);

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid state_abbreviation")
            );
        });

        it("should skip entries with an empty state_abbreviation", async () => {
            const bulkWriteSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ state_abbreviation: "" }),
            ]);

            expect(bulkWriteSpy).not.toHaveBeenCalled();
        });

        it("should skip entries where birds_affected is not a number", async () => {
            const bulkWriteSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ birds_affected: NaN }),
            ]);

            expect(bulkWriteSpy).not.toHaveBeenCalled();
        });

        it("should skip entries where latitude is Infinity", async () => {
            const bulkWriteSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ latitude: Infinity }),
            ]);

            expect(bulkWriteSpy).not.toHaveBeenCalled();
        });

        it("should process valid entries and skip invalid ones in the same array", async () => {
            const bulkWriteSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ state_abbreviation: "PA" }),
                makeEntry({ state_abbreviation: "INVALID" }),
                makeEntry({ state_abbreviation: "WA" }),
            ]);

            expect(bulkWriteSpy).toHaveBeenCalledTimes(1);
            const operations = (bulkWriteSpy.mock.calls[0] as any)[0];
            expect(operations).toHaveLength(2);
        });

        it("should accept all valid US state abbreviations", async () => {
            const bulkWriteSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ state_abbreviation: "CA" }),
                makeEntry({ state_abbreviation: "TX" }),
                makeEntry({ state_abbreviation: "DC" }),
                makeEntry({ state_abbreviation: "PR" }),
            ]);

            expect(bulkWriteSpy).toHaveBeenCalledTimes(1);
            const operations = (bulkWriteSpy.mock.calls[0] as any)[0];
            expect(operations).toHaveLength(4);
        });

        it("should throw when state name is empty string", async () => {
            jest.spyOn(
                FlockCasesByStateModel.getModel,
                "bulkWrite"
            ).mockResolvedValue({} as any);

            await expect(
                service.createOrUpdateStateData([makeEntry({ state: "" })])
            ).rejects.toThrow(
                "Failed to update Model information due to state name"
            );
        });

        it("should throw when state name is not in VALID_STATE_NAMES", async () => {
            jest.spyOn(
                FlockCasesByStateModel.getModel,
                "bulkWrite"
            ).mockResolvedValue({} as any);

            await expect(
                service.createOrUpdateStateData([
                    makeEntry({ state: "Pensylvania" }),
                ])
            ).rejects.toThrow(
                "Failed to update Model information due to state name"
            );
        });

        it("should log an error when state name is invalid", async () => {
            const errorSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            jest.spyOn(
                FlockCasesByStateModel.getModel,
                "bulkWrite"
            ).mockResolvedValue({} as any);

            await expect(
                service.createOrUpdateStateData([makeEntry({ state: "" })])
            ).rejects.toThrow();

            expect(errorSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid state name")
            );
        });

        it("should normalize state_abbreviation to uppercase before querying", async () => {
            const bulkWriteSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ state_abbreviation: "pa" }),
            ]);

            expect(bulkWriteSpy).toHaveBeenCalledTimes(1);
            const operations = (bulkWriteSpy.mock.calls[0] as any)[0];
            expect(operations[0].updateOne.filter).toEqual({
                state_abbreviation: "PA",
            });
        });
    });

    // -- createOrUpdateStateData - query shape --------------------------------

    describe("createOrUpdateStateData - query shape", () => {
        it("should query by state_abbreviation not state name", async () => {
            const bulkWriteSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([makeEntry()]);

            const operations = (bulkWriteSpy.mock.calls[0] as any)[0];
            const filter = operations[0].updateOne.filter;
            expect(filter).toHaveProperty("state_abbreviation");
            expect(filter).not.toHaveProperty("state");
        });

        it("should call bulkWrite with upsert: true in each operation", async () => {
            const bulkWriteSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([makeEntry()]);

            const operations = (bulkWriteSpy.mock.calls[0] as any)[0];
            expect(operations[0].updateOne.upsert).toBe(true);
        });

        it("should batch all valid entries into a single bulkWrite call", async () => {
            const bulkWriteSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ state_abbreviation: "PA" }),
                makeEntry({ state_abbreviation: "WA" }),
                makeEntry({ state_abbreviation: "CA" }),
            ]);

            expect(bulkWriteSpy).toHaveBeenCalledTimes(1);
            const operations = (bulkWriteSpy.mock.calls[0] as any)[0];
            expect(operations).toHaveLength(3);
        });

        it("should not call bulkWrite when flockData is empty", async () => {
            const bulkWriteSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "bulkWrite")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([]);

            expect(bulkWriteSpy).not.toHaveBeenCalled();
        });
    });

    // -- createOrUpdateStateData - error handling -----------------------------

    describe("createOrUpdateStateData - error handling", () => {
        it("should log an error when bulkWrite throws", async () => {
            jest.spyOn(
                FlockCasesByStateModel.getModel,
                "bulkWrite"
            ).mockRejectedValueOnce(new Error("DB error"));
            const logSpy = jest
                .spyOn(logger, "error")
                .mockImplementation(() => logger);

            await expect(
                service.createOrUpdateStateData([makeEntry()])
            ).rejects.toThrow();

            expect(logSpy).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Failed to update data for Flock Cases By State"
                )
            );
        });

        it("should throw when bulkWrite fails", async () => {
            jest.spyOn(
                FlockCasesByStateModel.getModel,
                "bulkWrite"
            ).mockRejectedValueOnce(new Error("DB error"));

            await expect(
                service.createOrUpdateStateData([makeEntry()])
            ).rejects.toThrow("Failed to update Model information");
        });
    });
});
