import {FlockCasesByStateModel} from "../../src/models/flock-cases-by-state-model";

describe("FlockCasesByStateModel", () => {
    it("should have the correct model name", () => {
        const schemaName = FlockCasesByStateModel.getModel.modelName;
        expect(schemaName).toEqual("FlockCasesByState");
    });
    it("should have the correct fields", () => {
        const schemaFields = FlockCasesByStateModel.getModel.schema.obj;
        expect(schemaFields).toHaveProperty("state");
        expect(schemaFields).toHaveProperty("totalBirdsAffected");
        expect(schemaFields).toHaveProperty("totalFlocksAffected");
        expect(schemaFields).toHaveProperty("commercialFlocksAffected");
        expect(schemaFields).toHaveProperty("backyardFlocksAffected");
        expect(schemaFields).toHaveProperty("birdsPerFlock");
        expect(schemaFields).toHaveProperty("lastReportedDate");
        expect(schemaFields).toHaveProperty("latitude");
        expect(schemaFields).toHaveProperty("longitude");
    });
    it("should have the correct datatypes for each field", () => {
        const schemaFields = FlockCasesByStateModel.getModel.schema.obj;
        expect(schemaFields.state).toBe(String)
        expect(schemaFields.totalBirdsAffected).toBe(Number)
        expect(schemaFields.totalFlocksAffected).toBe(Number)
        expect(schemaFields.commercialFlocksAffected).toBe(Number)
        expect(schemaFields.backyardFlocksAffected).toBe(Number)
        expect(schemaFields.birdsPerFlock).toBe(Number)
        expect(schemaFields.lastReportedDate).toBe(Date)
        expect(schemaFields.latitude).toBe(Number)
        expect(schemaFields.longitude).toBe(Number)
    });
});