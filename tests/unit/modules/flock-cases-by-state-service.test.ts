import { FlockCasesByStateService } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.service";
import { FlockCasesByStateModel } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.model";
import { FlockCasesByState } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.interface";
import { logger } from "../../../src/utils/winston-logger";

// ---- Factories --------------------------------------------------------------

const makeEntry = (overrides: Partial<FlockCasesByState> = {}): FlockCasesByState => ({
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
            const findOneAndUpdateSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ state_abbreviation: "INVALID" }),
            ]);

            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it("should log a warning when state_abbreviation is invalid", async () => {
            jest.spyOn(
                FlockCasesByStateModel.getModel,
                "findOneAndUpdate"
            ).mockResolvedValue({} as any);
            const warnSpy = jest.spyOn(logger, "warn").mockImplementation(() => logger);

            await service.createOrUpdateStateData([
                makeEntry({ state_abbreviation: "INVALID" }),
            ]);

            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("invalid state_abbreviation")
            );
        });

        it("should skip entries with an empty state_abbreviation", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ state_abbreviation: "" }),
            ]);

            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it("should skip entries where birds_affected is not a number", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ birds_affected: NaN }),
            ]);

            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it("should skip entries where latitude is Infinity", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ latitude: Infinity }),
            ]);

            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });

        it("should process valid entries and skip invalid ones in the same array", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ state_abbreviation: "PA" }),
                makeEntry({ state_abbreviation: "INVALID" }),
                makeEntry({ state_abbreviation: "WA" }),
            ]);

            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(2);
        });

        it("should accept all valid US state abbreviations", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ state_abbreviation: "CA" }),
                makeEntry({ state_abbreviation: "TX" }),
                makeEntry({ state_abbreviation: "DC" }),
                makeEntry({ state_abbreviation: "PR" }),
            ]);

            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(4);
        });

        it("should normalize state_abbreviation to uppercase before querying", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ state_abbreviation: "pa" }),
            ]);

            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                { state_abbreviation: "PA" },
                expect.any(Object),
                expect.any(Object)
            );
        });
    });

    // -- createOrUpdateStateData - query shape --------------------------------

    describe("createOrUpdateStateData - query shape", () => {
        it("should query by state_abbreviation not state name", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([makeEntry()]);

            const filter = (findOneAndUpdateSpy.mock.calls[0] as any)[0];
            expect(filter).toHaveProperty("state_abbreviation");
            expect(filter).not.toHaveProperty("state");
        });

        it("should call findOneAndUpdate with upsert: true", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([makeEntry()]);

            expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
                expect.any(Object),
                expect.any(Object),
                { upsert: true }
            );
        });

        it("should call findOneAndUpdate once per valid entry", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([
                makeEntry({ state_abbreviation: "PA" }),
                makeEntry({ state_abbreviation: "WA" }),
                makeEntry({ state_abbreviation: "CA" }),
            ]);

            expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(3);
        });

        it("should not call findOneAndUpdate when flockData is empty", async () => {
            const findOneAndUpdateSpy = jest
                .spyOn(FlockCasesByStateModel.getModel, "findOneAndUpdate")
                .mockResolvedValue({} as any);

            await service.createOrUpdateStateData([]);

            expect(findOneAndUpdateSpy).not.toHaveBeenCalled();
        });
    });

    // -- createOrUpdateStateData - error handling -----------------------------

    describe("createOrUpdateStateData - error handling", () => {
        it("should log an error when findOneAndUpdate throws", async () => {
            jest.spyOn(
                FlockCasesByStateModel.getModel,
                "findOneAndUpdate"
            ).mockRejectedValueOnce(new Error("DB error"));
            const logSpy = jest.spyOn(logger, "error").mockImplementation(() => logger);

            await expect(
                service.createOrUpdateStateData([makeEntry()])
            ).rejects.toThrow();

            expect(logSpy).toHaveBeenCalledWith(
                expect.stringContaining("Failed to update data for Flock Cases By State")
            );
        });

        it("should throw when findOneAndUpdate fails", async () => {
            jest.spyOn(
                FlockCasesByStateModel.getModel,
                "findOneAndUpdate"
            ).mockRejectedValueOnce(new Error("DB error"));

            await expect(
                service.createOrUpdateStateData([makeEntry()])
            ).rejects.toThrow("Failed to update Model information");
        });
    });
});