import { FlockCasesByStateService } from "../../../src/services/model-services/flock-cases-by-state-service";
import { IFlockCasesByState } from "../../../src/interfaces/i-flock-cases-by-state";
import * as Mongoose from "mongoose";
import { FlockCasesByStateModel } from "../../../src/models/flock-cases-by-state-model";
import dotenv from "dotenv";

dotenv.config();

describe("FlockCasesByStateService Integration", () => {
    let flockCasesByStateService: FlockCasesByStateService;

    beforeAll(async () => {
        try {
            await Mongoose.connect(process.env.MONGODB_URI!);
            console.log("MongoDB connected successfully.");
        } catch (error) {
            console.error("Error connecting to MongoDB:", error);
            throw new Error("MongoDB connection failed");
        }
    }, 10000);

    beforeEach(() => {
        jest.resetModules();
        flockCasesByStateService = new FlockCasesByStateService();
    });

    it("should create a state data entry when createOrUpdateStateData is called with an array containing state data", async () => {
        // First define the object that we want to store using the data type we are using
        const flockData: IFlockCasesByState[] = [
            {
                stateAbbreviation: "PA",
                state: "Pennsylvania",
                backyardFlocks: 2344370,
                commercialFlocks: 7,
                birdsAffected: 7,
                totalFlocks: 390728,
                latitude: 40.99773861,
                longitude: -76.19300025,
                lastReportedDate: new Date(Date.UTC(2025, 2 - 1, 5)),
            },
        ];
        const findOneAndUpdateSpy = jest.spyOn(
            FlockCasesByStateModel.getModel,
            "findOneAndUpdate"
        );

        // Call the create or update state data in our service and pass our flock data array
        await flockCasesByStateService.createOrUpdateStateData(flockData);

        // Now get query the database and get all the entries in the database should be only 1 entry
        const queryFromDB = await flockCasesByStateService.getAllFlockCases();

        // Expect that the findOneAndUpdate function was called with the correct parameters
        expect(findOneAndUpdateSpy).toHaveBeenCalledWith(
            { state: flockData[0].state },
            flockData[0],
            { upsert: true }
        );

        // We should only get 1 state entry back from the database
        expect(queryFromDB.length).toBe(1);

        // Since we use Mongoose we need to strip the proxied object portion from our result
        // This is done by Stringify and then parsing.
        const stripProxiedObject = (obj: IFlockCasesByState[]) =>
            JSON.parse(JSON.stringify(obj));

        // Now our state data from our DB should equal our flockData that we made earlier
        expect(stripProxiedObject(queryFromDB)).toEqual(
            stripProxiedObject(flockData)
        );
    });

    it("should update the birdsAffected data for Pennsylvania when we call createOrUpdateStateData with updated state data", async () => {
        // First define the object that we want to store using the data type we are using
        const flockData: IFlockCasesByState[] = [
            {
                stateAbbreviation: "PA",
                state: "Pennsylvania",
                backyardFlocks: 2344370,
                commercialFlocks: 7,
                birdsAffected: 7,
                totalFlocks: 390728,
                latitude: 40.99773861,
                longitude: -76.19300025,
                lastReportedDate: new Date(Date.UTC(2025, 2 - 1, 5)),
            },
        ];

        // Call the create or update state data in our service and pass our flock data array
        await flockCasesByStateService.createOrUpdateStateData(flockData);
        // Record before updating
        const originalStateInfo = await FlockCasesByStateModel.getModel.find(
            {}
        );

        // Now modify the flockData and change the birdsAffected field to 0
        flockData[0].birdsAffected = 0;

        // Call the create or update state data to update Pennsylvania's flock data for birdsAffected to now equal 0
        await flockCasesByStateService.createOrUpdateStateData(flockData);

        // Now get query the database and get all the entries in the database should be only 1 entry
        const queryFromDB = await FlockCasesByStateModel.getModel.find({});

        // We should only get 1 state entry back from the database
        expect(queryFromDB.length).toBe(1);

        // The state that will be updated should be Pennsylvania
        expect(queryFromDB[0].state).toBe("Pennsylvania");

        // Birds affected should be updated to be 0
        expect(queryFromDB[0].birdsAffected).toEqual(0);

        expect(queryFromDB[0]._id).toEqual(originalStateInfo[0]._id);
    });

    afterEach(async () => {
        // Drop the database so it's ready for our next test
        await FlockCasesByStateModel.getModel.db.dropDatabase();
    });

    afterAll(async () => {
        // Disconnect from mongo after all our tests
        await Mongoose.disconnect();
    });
});
