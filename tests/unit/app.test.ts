import mongoose, { ConnectOptions, Mongoose, MongooseError } from "mongoose";
import { App } from "../../src/app";
import express from "express";
import { DatabaseService } from "../../src/services/database-service";
import { LastReportDateService } from "../../src/services/model-services/last-report-date-service";
import { logger } from "../../src/utils/winston-logger";

describe("App Unit Test", () => {
    it("should call serverStart when app is created as an object", async () => {
        // Spy on our logger and the info method
        const loggerInfoSpy = jest.spyOn(logger, "info");

        // Create a database service spy and mock the implementation to just resolve the promise
        // This will prevent calling Mongoose .connect()
        const databaseServiceSpy = jest
            .spyOn(DatabaseService, "connect")
            .mockImplementation(() => {
                return Promise.resolve();
            });

        // Mock the last report date service function and resolve the promise
        const mockLastReportDateService = {
            initializeLastReportDate: jest
                .fn()
                .mockResolvedValueOnce(undefined),
        };
        // Create an app object
        const app = new App(
            mockLastReportDateService as unknown as LastReportDateService
        );
        // Wait for the serverStart function to be executed
        await app["serverStart"]();
        // Our logger info should report that we are alive
        expect(loggerInfoSpy).toHaveBeenCalledWith(
            "FlockWatch Server is ready!"
        );
        // Database service spy should have been called
        expect(databaseServiceSpy).toHaveBeenCalled();
        // Initialize last report date should be called
        expect(
            mockLastReportDateService.initializeLastReportDate
        ).toHaveBeenCalled();
        // Restore/Clear all the mocks we have have
        loggerInfoSpy.mockRestore();
        databaseServiceSpy.mockRestore();
        mockLastReportDateService.initializeLastReportDate.mockClear();
    });
});
