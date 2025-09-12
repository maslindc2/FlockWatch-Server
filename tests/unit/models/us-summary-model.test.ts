import { IUSSummaryStats } from "../../../src/interfaces/i-us-summary-stats";
import { USSummaryModel } from "../../../src/models/us-summary-model";

function getFieldType(field: any): any {
    return typeof field === "function" ? field : field.type;
}

describe("USSummaryModel", () => {
    it("should have the correct collection name when we define a USSummaryModel", () => {
        const collectionName = USSummaryModel.getModel.collection.name;
        expect(collectionName).toEqual("us-summary");
    });
    it("should have the correct model name", () => {
        const schemaName = USSummaryModel.getModel.modelName;
        expect(schemaName).toEqual("us-summary");
    })
    it("should have the correct top-level fields", () => {
        const schemaFields = USSummaryModel.getModel.schema.obj;
        expect(schemaFields).toHaveProperty("key");
        expect(schemaFields).toHaveProperty("allTimeTotals");
        expect(schemaFields).toHaveProperty("periodSummaries");
    })
    it("should have the correct fields inside allTimeTotals", () => {
        const allTimeTotalsFields = (USSummaryModel as any).allTimeTotalsSchema.obj;
        
        expect(allTimeTotalsFields).toHaveProperty("totalStatesAffected");
        expect(allTimeTotalsFields).toHaveProperty("totalBirdsAffected");
        expect(allTimeTotalsFields).toHaveProperty("totalFlocksAffected");
        expect(allTimeTotalsFields).toHaveProperty("totalBackyardFlocksAffected");
        expect(allTimeTotalsFields).toHaveProperty("totalCommercialFlocksAffected");

        expect(getFieldType(allTimeTotalsFields.totalStatesAffected)).toBe(Number);
        expect(getFieldType(allTimeTotalsFields.totalBirdsAffected)).toBe(Number);
        expect(getFieldType(allTimeTotalsFields.totalFlocksAffected)).toBe(Number);
        expect(getFieldType(allTimeTotalsFields.totalBackyardFlocksAffected)).toBe(Number);
        expect(getFieldType(allTimeTotalsFields.totalCommercialFlocksAffected)).toBe(Number);

        expect((allTimeTotalsFields.totalStatesAffected as any).index).toBe(true);
    })
    it("should have the correct fields inside periodSummaries", () => {
        const periodSummaryFields = (USSummaryModel as any).periodSummarySchema.obj;
        
        expect(periodSummaryFields).toHaveProperty("periodName");
        expect(periodSummaryFields).toHaveProperty("totalBirdsAffected");
        expect(periodSummaryFields).toHaveProperty("totalFlocksAffected");
        expect(periodSummaryFields).toHaveProperty("totalBackyardFlocksAffected");
        expect(periodSummaryFields).toHaveProperty("totalCommercialFlocksAffected");

        expect(getFieldType(periodSummaryFields.periodName)).toBe(String);
        expect(getFieldType(periodSummaryFields.totalBirdsAffected)).toBe(Number);
        expect(getFieldType(periodSummaryFields.totalFlocksAffected)).toBe(Number);
        expect(getFieldType(periodSummaryFields.totalBackyardFlocksAffected)).toBe(Number);
        expect(getFieldType(periodSummaryFields.totalCommercialFlocksAffected)).toBe(Number);
    });
});
