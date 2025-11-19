import { LastReportDateModel } from "../../../src/modules/last-report-date/last-report-date.model";

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
        expect(schemaFields).toHaveProperty("last_scraped_date");
        expect(schemaFields).toHaveProperty("auth_id");
    });
    it("should have the correct datatypes for each field when we define a LastReportDateModel", () => {
        const schemaFields = LastReportDateModel.getModel.schema.obj;
        expect(getFieldType(schemaFields.last_scraped_date)).toBe(Date);
        expect(getFieldType(schemaFields.auth_id)).toBe(String);

        expect((schemaFields.last_scraped_date as any).index).toBe(true);
        expect((schemaFields.auth_id as any).index).toBe(true);
    });
});
