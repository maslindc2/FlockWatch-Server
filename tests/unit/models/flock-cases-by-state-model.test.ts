import { FlockCasesByStateModel } from "../../../src/modules/flock-cases-by-state/flock-cases-by-state.model";

describe("FlockCasesByStateModel", () => {
    it("should have the correct collection name", () => {
        const collectionName = FlockCasesByStateModel.getModel.collection.name;
        expect(collectionName).toEqual("flock-cases-by-state");
    });
    it("should have the correct model name", () => {
        const schemaName = FlockCasesByStateModel.getModel.modelName;
        expect(schemaName).toEqual("flock-cases-by-state");
    });
    it("should have the correct fields", () => {
        const schemaFields = FlockCasesByStateModel.getModel.schema.obj;
        expect(schemaFields).toHaveProperty("state_abbreviation");
        expect(schemaFields).toHaveProperty("state");
        expect(schemaFields).toHaveProperty("backyard_flocks");
        expect(schemaFields).toHaveProperty("commercial_flocks");
        expect(schemaFields).toHaveProperty("birds_affected");
        expect(schemaFields).toHaveProperty("total_flocks");
        expect(schemaFields).toHaveProperty("latitude");
        expect(schemaFields).toHaveProperty("longitude");
        expect(schemaFields).toHaveProperty("last_reported_detection");
    });
    it("should have the correct datatypes for each field", () => {
        const schemaFields = FlockCasesByStateModel.getModel.schema.obj;
        expect(schemaFields.state_abbreviation).toStrictEqual({
            index: true,
            type: String,
        });
        expect(schemaFields.state).toBe(String);
        expect(schemaFields.backyard_flocks).toBe(Number);
        expect(schemaFields.commercial_flocks).toBe(Number);
        expect(schemaFields.birds_affected).toBe(Number);
        expect(schemaFields.total_flocks).toBe(Number);
        expect(schemaFields.latitude).toBe(Number);
        expect(schemaFields.longitude).toBe(Number);
        expect(schemaFields.last_reported_detection).toBe(Date);
    });
});
