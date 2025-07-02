import { FlockCasesByStateModel } from "../../../src/models/flock-cases-by-state-model";

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
        expect(schemaFields).toHaveProperty("stateAbbreviation");
        expect(schemaFields).toHaveProperty("state");
        expect(schemaFields).toHaveProperty("backyardFlocks");
        expect(schemaFields).toHaveProperty("commercialFlocks");
        expect(schemaFields).toHaveProperty("birdsAffected");
        expect(schemaFields).toHaveProperty("totalFlocks");
        expect(schemaFields).toHaveProperty("latitude");
        expect(schemaFields).toHaveProperty("longitude");
        expect(schemaFields).toHaveProperty("lastReportedDate");
    });
    it("should have the correct datatypes for each field", () => {
        const schemaFields = FlockCasesByStateModel.getModel.schema.obj;
        expect(schemaFields.stateAbbreviation).toStrictEqual({"index" : true, "type": String});
        expect(schemaFields.state).toBe(String);
        expect(schemaFields.backyardFlocks).toBe(Number);
        expect(schemaFields.commercialFlocks).toBe(Number);
        expect(schemaFields.birdsAffected).toBe(Number);
        expect(schemaFields.totalFlocks).toBe(Number);
        expect(schemaFields.latitude).toBe(Number);
        expect(schemaFields.longitude).toBe(Number);
        expect(schemaFields.lastReportedDate).toBe(Date);
    });
});
