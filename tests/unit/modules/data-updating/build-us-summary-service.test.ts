import { BuildUSSummary } from "../../../../src/modules/data-updating/build-us-summary.service";
import { FlockCasesByState } from "../../../../src/modules/flock-cases-by-state/flock-cases-by-state.interface";
import { PeriodSummary } from "../../../../src/modules/us-summary/us-summary-stats.interface";

// ---- Factories --------------------------------------------------------------

const makeStateObj = (overrides: Partial<FlockCasesByState> = {}): FlockCasesByState => ({
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

const makePeriod = (overrides: Partial<PeriodSummary> = {}): PeriodSummary => ({
    period_name: "last_30_days",
    total_birds_affected: 50,
    total_flocks_affected: 5,
    total_backyard_flocks_affected: 2,
    total_commercial_flocks_affected: 3,
    ...overrides,
});

// ---- Tests ------------------------------------------------------------------

describe("BuildUSSummary", () => {
    let buildUSSummary: BuildUSSummary;

    beforeEach(() => {
        buildUSSummary = new BuildUSSummary();
    });

    // -- return shape ---------------------------------------------------------

    describe("return shape", () => {
        it("should always set key to 'us-summary'", () => {
            const result = buildUSSummary.createUSSummaryData([], []);
            expect(result.key).toBe("us-summary");
        });

        it("should include all_time_totals in the result", () => {
            const result = buildUSSummary.createUSSummaryData([], []);
            expect(result).toHaveProperty("all_time_totals");
        });

        it("should include period_summaries in the result", () => {
            const periods = [makePeriod()];
            const result = buildUSSummary.createUSSummaryData([], periods);
            expect(result).toHaveProperty("period_summaries");
        });

        it("should pass period_summaries through unchanged", () => {
            const periods = [
                makePeriod({ period_name: "last_30_days" }),
                makePeriod({ period_name: "last_7_days" }),
            ];
            const result = buildUSSummary.createUSSummaryData([], periods);
            expect(result.period_summaries).toEqual(periods);
        });
    });

    // -- empty input ----------------------------------------------------------

    describe("empty flock_cases_by_state", () => {
        it("should return zero for total_states_affected", () => {
            const result = buildUSSummary.createUSSummaryData([], []);
            expect(result.all_time_totals.total_states_affected).toBe(0);
        });

        it("should return zero for total_birds_affected", () => {
            const result = buildUSSummary.createUSSummaryData([], []);
            expect(result.all_time_totals.total_birds_affected).toBe(0);
        });

        it("should return zero for total_flocks_affected", () => {
            const result = buildUSSummary.createUSSummaryData([], []);
            expect(result.all_time_totals.total_flocks_affected).toBe(0);
        });

        it("should return zero for total_backyard_flocks_affected", () => {
            const result = buildUSSummary.createUSSummaryData([], []);
            expect(result.all_time_totals.total_backyard_flocks_affected).toBe(0);
        });

        it("should return zero for total_commercial_flocks_affected", () => {
            const result = buildUSSummary.createUSSummaryData([], []);
            expect(result.all_time_totals.total_commercial_flocks_affected).toBe(0);
        });
    });

    // -- single state ---------------------------------------------------------

    describe("single state", () => {
        it("should count one state as total_states_affected", () => {
            const result = buildUSSummary.createUSSummaryData([makeStateObj()], []);
            expect(result.all_time_totals.total_states_affected).toBe(1);
        });

        it("should sum birds_affected correctly", () => {
            const result = buildUSSummary.createUSSummaryData(
                [makeStateObj({ birds_affected: 250 })],
                []
            );
            expect(result.all_time_totals.total_birds_affected).toBe(250);
        });

        it("should sum total_flocks correctly", () => {
            const result = buildUSSummary.createUSSummaryData(
                [makeStateObj({ total_flocks: 20 })],
                []
            );
            expect(result.all_time_totals.total_flocks_affected).toBe(20);
        });

        it("should sum backyard_flocks correctly", () => {
            const result = buildUSSummary.createUSSummaryData(
                [makeStateObj({ backyard_flocks: 8 })],
                []
            );
            expect(result.all_time_totals.total_backyard_flocks_affected).toBe(8);
        });

        it("should sum commercial_flocks correctly", () => {
            const result = buildUSSummary.createUSSummaryData(
                [makeStateObj({ commercial_flocks: 12 })],
                []
            );
            expect(result.all_time_totals.total_commercial_flocks_affected).toBe(12);
        });
    });

    // -- multiple states ------------------------------------------------------

    describe("multiple states", () => {
        it("should count each state object as one affected state", () => {
            const states = [
                makeStateObj({ state_abbreviation: "PA" }),
                makeStateObj({ state_abbreviation: "WA" }),
                makeStateObj({ state_abbreviation: "CA" }),
            ];
            const result = buildUSSummary.createUSSummaryData(states, []);
            expect(result.all_time_totals.total_states_affected).toBe(3);
        });

        it("should sum birds_affected across all states", () => {
            const states = [
                makeStateObj({ birds_affected: 100 }),
                makeStateObj({ birds_affected: 200 }),
                makeStateObj({ birds_affected: 300 }),
            ];
            const result = buildUSSummary.createUSSummaryData(states, []);
            expect(result.all_time_totals.total_birds_affected).toBe(600);
        });

        it("should sum total_flocks across all states", () => {
            const states = [
                makeStateObj({ total_flocks: 5 }),
                makeStateObj({ total_flocks: 10 }),
            ];
            const result = buildUSSummary.createUSSummaryData(states, []);
            expect(result.all_time_totals.total_flocks_affected).toBe(15);
        });

        it("should sum backyard_flocks across all states", () => {
            const states = [
                makeStateObj({ backyard_flocks: 4 }),
                makeStateObj({ backyard_flocks: 6 }),
            ];
            const result = buildUSSummary.createUSSummaryData(states, []);
            expect(result.all_time_totals.total_backyard_flocks_affected).toBe(10);
        });

        it("should sum commercial_flocks across all states", () => {
            const states = [
                makeStateObj({ commercial_flocks: 3 }),
                makeStateObj({ commercial_flocks: 9 }),
            ];
            const result = buildUSSummary.createUSSummaryData(states, []);
            expect(result.all_time_totals.total_commercial_flocks_affected).toBe(12);
        });

        it("should produce correct totals across all fields simultaneously", () => {
            const states = [
                makeStateObj({
                    birds_affected: 100,
                    total_flocks: 10,
                    backyard_flocks: 3,
                    commercial_flocks: 7,
                }),
                makeStateObj({
                    birds_affected: 200,
                    total_flocks: 20,
                    backyard_flocks: 6,
                    commercial_flocks: 14,
                }),
            ];
            const result = buildUSSummary.createUSSummaryData(states, []);
            expect(result.all_time_totals).toEqual({
                total_states_affected: 2,
                total_birds_affected: 300,
                total_flocks_affected: 30,
                total_backyard_flocks_affected: 9,
                total_commercial_flocks_affected: 21,
            });
        });
    });

    // -- immutability ---------------------------------------------------------

    describe("immutability", () => {
        it("should not mutate the input flock_cases_by_state array", () => {
            const states = [makeStateObj()];
            const original = JSON.stringify(states);
            buildUSSummary.createUSSummaryData(states, []);
            expect(JSON.stringify(states)).toBe(original);
        });

        it("should not mutate the input period_summaries array", () => {
            const periods = [makePeriod()];
            const original = JSON.stringify(periods);
            buildUSSummary.createUSSummaryData([], periods);
            expect(JSON.stringify(periods)).toBe(original);
        });
    });
});