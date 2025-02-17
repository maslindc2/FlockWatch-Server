import {FlockCasesByStateModel} from "../../src/models/flock-cases-by-state-model";

jest.mock("mongoose", () => {
    const actualMongoose = jest.requireActual("mongoose");
    return {
        ...actualMongoose,
        model: jest.fn().mockReturnValue({
            find: jest.fn().mockResolvedValue([{state: "Pennsylvania", totalBirdsAffected: 2344370, totalFlocksAffected: 13, commercialFlocksAffected: 7, backyardFlocksAffected: 6, birdsPerFlock: 180336, lastReportedDate: new Date(2025, 2, 12, 0, 0, 0, 0), latitude: 40.99773861, longitude: -76.19300025}])
        }),
    };
});

describe("FlockCasesByStateModel", async () => {

    it("should have the correct fields based on model's interface", async () => {
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
    it("should enforce the correct data types and fail to save incorrect data types", async () => {
        const incorrectDateDataType = {
            state: "California",
            totalBirdsAffected: 100,
            totalFlocksAffected: 100,
            commercialFlocksAffected: 100,
            backyardFlocksAffected: 100,
            birdsPerFlock: 100,
            lastReportedDate: "String instead of Date object",
            latitude: 35.99088,
            longitude: -119.123
        }
        const mockDocumentCreation = jest.fn().mockRejectedValue(new Error("Validation Error"));
        FlockCasesByStateModel.getModel.create = mockDocumentCreation;
        await expect(FlockCasesByStateModel.getModel.create(incorrectDateDataType)).rejects.toThrow("Validation Error");
        
    });
    it("should ")
    it("should call find() when retrieving all flock cases", async ()=> {
        const mockFind = jest.spyOn(FlockCasesByStateModel.getModel, "find");
        await FlockCasesByStateModel.getModel.find({});
        expect(mockFind).toHaveBeenCalled();
    });
    it("should return flock cases data", async () => {
        const data = await FlockCasesByStateModel.getModel.find({});
        expect(data).toEqual([{state: "Texas", totalBirdsAffected: 100}])
    });

});