import { LastReportDateService } from "../../../src/modules/last-report-date/last-report-date.service";
import { LastReportDate } from "../../../src/modules/last-report-date/last-report-date.interface";
import { LastReportDateModel } from "../../../src/modules/last-report-date/last-report-date.model";
import dotenv from "dotenv";

import { connect, disconnect, clearCollections } from "../setup/mongodb-setup";

jest.setTimeout(30000);

dotenv.config();

describe("LastReportDateService Integration", () => {
    let lastReportDateService: LastReportDateService;
    beforeAll(async () => {
        await connect();
    });

    beforeEach(() => {
        lastReportDateService = new LastReportDateService();
    });

    afterEach(async () => {
        await clearCollections();
    });

    afterAll(async () => {
        await disconnect();
    });

    it("should initialize the database with a new data entry", async () => {
        const expectedModelObj = {
            last_scraped_date: expect.any(Date),
            auth_id: expect.any(String),
        };

        // Initialize the database like it would on startup
        const createdRecord =
            await lastReportDateService.initializeLastReportDate();

        // Now our state data from our DB should equal our flockData that we made earlier
        expect(createdRecord).toMatchObject(expectedModelObj);
    });

    it("should return the existing record in the database if initialize was called twice", async () => {
        const modelSpy = jest.spyOn(LastReportDateModel.getModel, "findOne");

        // Initialize the database with our first call
        const initialRecord =
            await lastReportDateService.initializeLastReportDate();

        // Should get back the exact same record from our database since its been initialized already
        const existingRecord =
            await lastReportDateService.initializeLastReportDate();

        // Since we use Mongoose we need to strip the proxied object portion from our result
        // This is done by Stringify and then parsing.
        const stripProxiedObject = (obj: LastReportDate) =>
            JSON.parse(JSON.stringify(obj));

        // findOne should be called twice as we are in fact calling it twice
        expect(modelSpy).toHaveBeenCalledTimes(2);
        // We should get back the exact same record that we initialized the database with
        expect(stripProxiedObject(initialRecord)).toMatchObject(
            stripProxiedObject(existingRecord)
        );
    });

    it("should update the existing record creating a new authID and updating last scraped date when we successfully get new data", async () => {
        // Initialize the database with our first call
        await lastReportDateService.initializeLastReportDate();

        const initialLastScrapedDateObject =
            await lastReportDateService.getLastScrapedDate();
        const initialUpdatedAuthID = await lastReportDateService.getAuthID();

        // Call updateLastReportDate with a value of true which should change both the lastReportDate field and the authID
        await lastReportDateService.updateLastReportDate(true);

        const lastScrapedDateObject =
            await lastReportDateService.getLastScrapedDate();
        const updatedAuthID = await lastReportDateService.getAuthID();

        expect(initialLastScrapedDateObject!.last_scraped_date).not.toEqual(
            lastScrapedDateObject!.last_scraped_date
        );
        expect(initialUpdatedAuthID!.auth_id).not.toEqual(updatedAuthID);
    });

    it("should update the existing record creating a new authID and updating last scraped date when we successfully get new data", async () => {
        // Initialize the database with our first call
        const initialRecord =
            await lastReportDateService.initializeLastReportDate();

        // Call updateLastReportDate with a value of false which should ONLY change the authID and NOT the last report date
        await lastReportDateService.updateLastReportDate(false);

        const lastScrapedDateObject =
            await lastReportDateService.getLastScrapedDate();
        const updatedAuthID = await lastReportDateService.getAuthID();

        expect(initialRecord.last_scraped_date).toEqual(
            lastScrapedDateObject?.last_scraped_date
        );
        expect(initialRecord.auth_id).not.toEqual(updatedAuthID);
    });
});
