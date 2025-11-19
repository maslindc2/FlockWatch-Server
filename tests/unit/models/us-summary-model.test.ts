import { USSummaryModel } from "../../../src/modules/us-summary/us-summary.model";

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
    });
    it("should have the correct top-level fields", () => {
        const schemaFields = USSummaryModel.getModel.schema.obj;
        expect(schemaFields).toHaveProperty("key");
        expect(schemaFields).toHaveProperty("all_time_totals");
        expect(schemaFields).toHaveProperty("period_summaries");
    });
    it("should have the correct fields inside allTimeTotals", () => {
        const allTimeTotalsFields = (USSummaryModel as any).allTimeTotalsSchema
            .obj;

        expect(allTimeTotalsFields).toHaveProperty("total_states_affected");
        expect(allTimeTotalsFields).toHaveProperty("total_birds_affected");
        expect(allTimeTotalsFields).toHaveProperty("total_flocks_affected");
        expect(allTimeTotalsFields).toHaveProperty(
            "total_backyard_flocks_affected"
        );
        expect(allTimeTotalsFields).toHaveProperty(
            "total_commercial_flocks_affected"
        );

        expect(getFieldType(allTimeTotalsFields.total_states_affected)).toBe(
            Number
        );
        expect(getFieldType(allTimeTotalsFields.total_birds_affected)).toBe(
            Number
        );
        expect(getFieldType(allTimeTotalsFields.total_flocks_affected)).toBe(
            Number
        );
        expect(
            getFieldType(allTimeTotalsFields.total_backyard_flocks_affected)
        ).toBe(Number);
        expect(
            getFieldType(allTimeTotalsFields.total_commercial_flocks_affected)
        ).toBe(Number);

        expect((allTimeTotalsFields.total_states_affected as any).index).toBe(
            true
        );
    });
    it("should have the correct fields inside periodSummaries", () => {
        const periodSummaryFields = (USSummaryModel as any).periodSummarySchema
            .obj;

        expect(periodSummaryFields).toHaveProperty("period_name");
        expect(periodSummaryFields).toHaveProperty("total_birds_affected");
        expect(periodSummaryFields).toHaveProperty("total_flocks_affected");
        expect(periodSummaryFields).toHaveProperty(
            "total_backyard_flocks_affected"
        );
        expect(periodSummaryFields).toHaveProperty(
            "total_commercial_flocks_affected"
        );

        expect(getFieldType(periodSummaryFields.period_name)).toBe(String);
        expect(getFieldType(periodSummaryFields.total_birds_affected)).toBe(
            Number
        );
        expect(getFieldType(periodSummaryFields.total_flocks_affected)).toBe(
            Number
        );
        expect(
            getFieldType(periodSummaryFields.total_backyard_flocks_affected)
        ).toBe(Number);
        expect(
            getFieldType(periodSummaryFields.total_commercial_flocks_affected)
        ).toBe(Number);
    });
});
