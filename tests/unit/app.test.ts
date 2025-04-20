import mongoose, { ConnectOptions, Mongoose, MongooseError } from "mongoose";
import { App } from "../../src/app";
import express from "express";
import { DatabaseService } from "../../src/services/database-service";
import { LastReportDateService } from "../../src/services/model-services/last-report-date-service";
import { logger } from "../../src/utils/winston-logger";

describe("App Unit Test", () => {
    it("should call serverStart when app is created as an object", async () => {
        const loggerInfoSpy = jest.spyOn(logger, "info");

        const databaseServiceSpy = jest
            .spyOn(DatabaseService, "connect")
            .mockResolvedValueOnce(undefined);

        const mockLastReportDateService = {
            initializeLastReportDate: jest
                .fn()
                .mockResolvedValueOnce(undefined),
        };

        const app = new App(
            mockLastReportDateService as unknown as LastReportDateService
        );

        await app["serverStart"]();

        expect(loggerInfoSpy).toHaveBeenCalledWith(
            "FlockWatch Server is ready!"
        );
        expect(databaseServiceSpy).toHaveBeenCalled();
        expect(
            mockLastReportDateService.initializeLastReportDate
        ).toHaveBeenCalled();

        jest.clearAllMocks();
    });
});
