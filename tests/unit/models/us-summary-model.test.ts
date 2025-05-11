import { USSummaryModel } from "../../../src/models/us-summary-model";

function getFieldType(field: any): any {
    return typeof field === "function" ? field : field.type;
}

describe("USSummaryModel", () => {
    
    it("should have the correct collection name when we define a USSummaryModel", () => {
        const collectionName = USSummaryModel.getModel.collection.name;
        expect(collectionName).toEqual("us-summary");
    });
    it("should have the correct model name when we define a USSummaryModel", () => {
        const schemaName = USSummaryModel.getModel.modelName;
        expect(schemaName).toEqual("us-summary");
    });
    it("should have the correct fields when we define a USSummaryModel", () => {
        const schemaFields = USSummaryModel.getModel.schema.obj;
        expect(schemaFields).toHaveProperty("totalStatesAffected");
        expect(schemaFields).toHaveProperty("totalBirdsAffectedNationwide");
        expect(schemaFields).toHaveProperty("totalFlocksAffectedNationwide");
        expect(schemaFields).toHaveProperty("totalBackyardFlocksNationwide");
        expect(schemaFields).toHaveProperty("totalCommercialFlocksNationwide");
    });
    it("should have the correct datatypes for each field when we define a USSummaryModel", () => {
        const schemaFields = USSummaryModel.getModel.schema.obj;
    
        expect(getFieldType(schemaFields.totalStatesAffected)).toBe(Number);
        expect(getFieldType(schemaFields.totalBirdsAffectedNationwide)).toBe(Number);
        expect(getFieldType(schemaFields.totalFlocksAffectedNationwide)).toBe(Number);
        expect(getFieldType(schemaFields.totalBackyardFlocksNationwide)).toBe(Number);
        expect(getFieldType(schemaFields.totalCommercialFlocksNationwide)).toBe(Number);

        expect((schemaFields.totalStatesAffected as any).index).toBe(true);
    });
});
