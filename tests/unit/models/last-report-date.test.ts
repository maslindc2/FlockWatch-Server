import { LastReportDateModel } from "../../../src/models/last-report-date-model";
describe("LastReportDateModel", () => {
    it("should have the correct collection name", () => {
        const collectionName = LastReportDateModel.getModel.collection.name;
        expect(collectionName).toEqual("last-report-date");
    });
    it("should have the correct model name", () => {
        const schemaName = LastReportDateModel.getModel.modelName;
        expect(schemaName).toEqual("last-report-date");
    });
    it("should have the correct fields", () => {
        const schemaFields = LastReportDateModel.getModel.schema.obj;
        expect(schemaFields).toHaveProperty("lastScrapedDate");
        expect(schemaFields).toHaveProperty("authID");
    });
    it("should have the correct datatypes for each field", () => {
        const schemaFields = LastReportDateModel.getModel.schema.obj;
        expect(schemaFields.lastScrapedDate).toBe(Date);
        expect(schemaFields.authID).toBe(String);
    });
});
