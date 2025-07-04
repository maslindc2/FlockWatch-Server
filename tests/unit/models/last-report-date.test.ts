import { LastReportDateModel } from "../../../src/models/last-report-date-model";

function getFieldType(field: any): any {
    return typeof field === "function" ? field : field.type;
}

describe("LastReportDateModel", () => {
    it("should have the correct collection name when we define a LastReportDateModel", () => {
        const collectionName = LastReportDateModel.getModel.collection.name;
        expect(collectionName).toEqual("last-report-date");
    });
    it("should have the correct model name when we define a LastReportDateModel", () => {
        const schemaName = LastReportDateModel.getModel.modelName;
        expect(schemaName).toEqual("last-report-date");
    });
    it("should have the correct fields when we define a LastReportDateModel", () => {
        const schemaFields = LastReportDateModel.getModel.schema.obj;
        expect(schemaFields).toHaveProperty("lastScrapedDate");
        expect(schemaFields).toHaveProperty("authID");
    });
    it("should have the correct datatypes for each field when we define a LastReportDateModel", () => {
        const schemaFields = LastReportDateModel.getModel.schema.obj;
        expect(getFieldType(schemaFields.lastScrapedDate)).toBe(Date);
        expect(getFieldType(schemaFields.authID)).toBe(String);

        expect((schemaFields.lastScrapedDate as any).index).toBe(true);
        expect((schemaFields.authID as any).index).toBe(true);
    });
});
