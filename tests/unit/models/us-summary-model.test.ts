import { RollingPeriods } from "../../../src/config/rolling-periods";
import { USSummaryModel } from "../../../src/modules/us-summary/us-summary.model";
import {
    PeriodSummary,
    AllTimeTotals,
} from "../../../src/modules/us-summary/us-summary-stats.interface";

// ---- Helpers ----------------------------------------------------------------

function getFieldType(field: any): any {
    return typeof field === "function" ? field : field.type;
}

const makePeriod = (overrides: Partial<PeriodSummary> = {}): PeriodSummary => ({
    period_name: RollingPeriods[0],
    total_birds_affected: 100,
    total_flocks_affected: 10,
    total_backyard_flocks_affected: 3,
    total_commercial_flocks_affected: 7,
    ...overrides,
});

const makeAllTimeTotals = (
    overrides: Partial<AllTimeTotals> = {}
): AllTimeTotals => ({
    total_states_affected: 20,
    total_birds_affected: 500,
    total_flocks_affected: 50,
    total_backyard_flocks_affected: 15,
    total_commercial_flocks_affected: 35,
    ...overrides,
});

// ---- Schema constraints -----------------------------------------------------

describe("USSummaryModel - schema constraints", () => {
    const schema = USSummaryModel.getModel.schema;

    it("key field should be required", () => {
        expect(schema.path("key").isRequired).toBe(true);
    });

    it("key field should have unique constraint", () => {
        expect((schema.path("key") as any).options.unique).toBe(true);
    });

    it("key field should default to 'us-summary'", () => {
        expect((schema.obj as any).key.default).toBe("us-summary");
    });

    it("all_time_totals should be required", () => {
        expect((schema.obj as any).all_time_totals.required).toBe(true);
    });

    it("period_summaries should default to an empty array", () => {
        expect((schema.obj as any).period_summaries.default).toEqual([]);
    });

    it("periodSummarySchema should have _id disabled", () => {
        const opts = (USSummaryModel as any).periodSummarySchema.options;
        expect(opts._id).toBe(false);
    });

    it("allTimeTotalsSchema should have _id disabled", () => {
        const opts = (USSummaryModel as any).allTimeTotalsSchema.options;
        expect(opts._id).toBe(false);
    });
});

describe("USSummaryModel - periodSummarySchema required flags", () => {
    const fields = (USSummaryModel as any).periodSummarySchema.obj;

    it.each([
        "period_name",
        "total_birds_affected",
        "total_flocks_affected",
        "total_backyard_flocks_affected",
        "total_commercial_flocks_affected",
    ])("%s should be required", (fieldName) => {
        expect(fields[fieldName].required).toBe(true);
    });
});

describe("USSummaryModel - allTimeTotalsSchema required flags", () => {
    const fields = (USSummaryModel as any).allTimeTotalsSchema.obj;

    it.each([
        "total_birds_affected",
        "total_flocks_affected",
        "total_backyard_flocks_affected",
        "total_commercial_flocks_affected",
    ])("%s should be required", (fieldName) => {
        expect(fields[fieldName].required).toBe(true);
    });

    it("total_states_affected should NOT be required", () => {
        expect(fields.total_states_affected.required).toBeUndefined();
    });
});

// ---- formatPeriods ----------------------------------------------------------

describe("USSummaryModel.formatPeriods", () => {
    it("should return an empty object for an empty array", () => {
        expect(USSummaryModel.formatPeriods([])).toEqual({});
    });

    it("should key each entry by period_name", () => {
        const periods = [
            makePeriod({ period_name: "30-day" }),
            makePeriod({ period_name: "60-day" }),
        ];
        const result = USSummaryModel.formatPeriods(periods);
        expect(Object.keys(result)).toEqual(["30-day", "60-day"]);
    });

    it("should exclude period_name from the value object", () => {
        const period = makePeriod({ period_name: "30-day" });
        const result = USSummaryModel.formatPeriods([period]);
        expect(result["30-day"]).not.toHaveProperty("period_name");
    });

    it("should preserve all metric fields in the value object", () => {
        const period = makePeriod({ period_name: "30-day" });
        const result = USSummaryModel.formatPeriods([period]);
        expect(result["30-day"]).toEqual({
            total_birds_affected: period.total_birds_affected,
            total_flocks_affected: period.total_flocks_affected,
            total_backyard_flocks_affected:
                period.total_backyard_flocks_affected,
            total_commercial_flocks_affected:
                period.total_commercial_flocks_affected,
        });
    });

    it("should not mutate the original period objects", () => {
        const period = makePeriod({ period_name: "30-day" });
        const original = { ...period };
        USSummaryModel.formatPeriods([period]);
        expect(period).toEqual(original);
    });
});

// ---- upsertPeriodAtomic validation ------------------------------------------

describe("USSummaryModel.upsertPeriodAtomic - validation", () => {
    let findOneAndUpdateSpy: jest.SpyInstance;

    afterEach(() => jest.restoreAllMocks());

    it("should throw for an invalid period_name without hitting the DB", async () => {
        const badPeriod = makePeriod({ period_name: "not-a-real-period" });
        await expect(
            USSummaryModel.upsertPeriodAtomic(badPeriod)
        ).rejects.toThrow("Invalid period_name: not-a-real-period");
    });

    it("should sanitize the period object by stripping extra fields", async () => {
        const periodWithExtraFields = {
            ...makePeriod(),
            malicious_field: "injected",
            __proto__: { polluted: true },
        } as any;

        findOneAndUpdateSpy = jest
            .spyOn(USSummaryModel.getModel, "findOneAndUpdate")
            .mockResolvedValue({ key: "us-summary" } as any);

        await USSummaryModel.upsertPeriodAtomic(periodWithExtraFields);

        // Verify the sanitized period (without extra fields) was passed to DB
        const [, update] = findOneAndUpdateSpy.mock.calls[0];
        const updateStr = JSON.stringify(update);
        expect(updateStr).not.toContain("malicious_field");
        expect(updateStr).not.toContain("polluted");
    });
});

// ---- DB method mocks --------------------------------------------------------

describe("USSummaryModel.updateAllTimeTotals", () => {
    let findOneAndUpdateSpy: jest.SpyInstance;

    beforeEach(() => {
        findOneAndUpdateSpy = jest
            .spyOn(USSummaryModel.getModel, "findOneAndUpdate")
            .mockResolvedValue({ key: "us-summary" } as any);
    });

    afterEach(() => jest.restoreAllMocks());

    it("should call findOneAndUpdate with the correct filter", async () => {
        await USSummaryModel.updateAllTimeTotals(makeAllTimeTotals());
        expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
            { key: "us-summary" },
            expect.any(Object),
            expect.any(Object)
        );
    });

    it("should call findOneAndUpdate with $set for all_time_totals", async () => {
        const totals = makeAllTimeTotals();
        await USSummaryModel.updateAllTimeTotals(totals);
        expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
            expect.any(Object),
            { $set: { all_time_totals: totals } },
            expect.any(Object)
        );
    });

    it("should call findOneAndUpdate with upsert: true and new: true", async () => {
        await USSummaryModel.updateAllTimeTotals(makeAllTimeTotals());
        expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(Object),
            { upsert: true, returnDocument: "after" }
        );
    });

    it("should return the result from findOneAndUpdate", async () => {
        const result =
            await USSummaryModel.updateAllTimeTotals(makeAllTimeTotals());
        expect(result).toEqual({ key: "us-summary" });
    });
});

describe("USSummaryModel.upsertPeriodAtomic - DB calls", () => {
    let findOneAndUpdateSpy: jest.SpyInstance;

    afterEach(() => jest.restoreAllMocks());

    it("should update an existing period when the period is found", async () => {
        const period = makePeriod();
        findOneAndUpdateSpy = jest
            .spyOn(USSummaryModel.getModel, "findOneAndUpdate")
            .mockResolvedValue({ key: "us-summary" } as any);

        await USSummaryModel.upsertPeriodAtomic(period);

        expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
            { key: "us-summary" },
            expect.any(Array),
            { upsert: true, returnDocument: "after" }
        );
    });

    it("should push a new period when no existing period is found", async () => {
        const period = makePeriod();
        findOneAndUpdateSpy = jest
            .spyOn(USSummaryModel.getModel, "findOneAndUpdate")
            .mockResolvedValue({ key: "us-summary" } as any);

        await USSummaryModel.upsertPeriodAtomic(period);

        expect(findOneAndUpdateSpy).toHaveBeenCalledTimes(1);
        expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
            { key: "us-summary" },
            expect.any(Array),
            { upsert: true, returnDocument: "after" }
        );
    });

    it("should return the doc from the push call when no existing period is found", async () => {
        const period = makePeriod();
        const expected = { key: "us-summary", period_summaries: [period] };
        findOneAndUpdateSpy = jest
            .spyOn(USSummaryModel.getModel, "findOneAndUpdate")
            .mockResolvedValue(expected as any);

        const result = await USSummaryModel.upsertPeriodAtomic(period);
        expect(result).toEqual(expected);
    });
});
