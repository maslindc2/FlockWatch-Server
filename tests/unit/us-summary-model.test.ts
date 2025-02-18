import { USSummaryModel } from "../../src/models/us-summary-model";

describe("USSummaryModel", () => {
    it("should have the correct fields", () => {
        const schemaFields = USSummaryModel.getModel.schema.obj;
        expect(schemaFields).toHaveProperty("totalStatesAffected");
        expect(schemaFields).toHaveProperty("totalBirdsAffectedNationwide");
        expect(schemaFields).toHaveProperty("totalFlocksAffectedNationwide");
        expect(schemaFields).toHaveProperty("totalBackyardFlocksNationwide");
        expect(schemaFields).toHaveProperty("totalCommercialFlocksNationwide");
    });
    it("should have the correct datatypes for each field", () => {
        const schemaFields = USSummaryModel.getModel.schema.obj;
        expect(schemaFields.totalStatesAffected).toBe(Number);
        expect(schemaFields.totalBirdsAffectedNationwide).toBe(Number);
        expect(schemaFields.totalFlocksAffectedNationwide).toBe(Number);
        expect(schemaFields.totalBackyardFlocksNationwide).toBe(Number);
        expect(schemaFields.totalCommercialFlocksNationwide).toBe(Number);
    });
});
