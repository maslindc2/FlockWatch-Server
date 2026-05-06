import dotenv from "dotenv";
import {DatabaseService} from "../../../../src/modules/database/database.service";
import { logger } from "../../../../src/utils/winston-logger";
import mongoose, { ConnectOptions, Mongoose, MongooseError } from "mongoose";

dotenv.config();

describe("DatabaseService Unit", () => {
    afterEach(() => jest.restoreAllMocks());

    // -- connect --------------------------------------------------------------

    describe("connect", () => {
        it("should call mongoose.connect with the provided connection string", async () => {
            const connectSpy = jest
                .spyOn(mongoose, "connect")
                .mockResolvedValueOnce(mongoose);

            await DatabaseService.connect("mongodb://localhost:27017");

            expect(connectSpy).toHaveBeenCalledWith(
                "mongodb://localhost:27017"
            );
        });

        it("should log success when mongoose.connect resolves", async () => {
            jest.spyOn(mongoose, "connect").mockResolvedValueOnce(mongoose);
            const loggerInfoSpy = jest.spyOn(logger, "info");

            await DatabaseService.connect("mongodb://localhost:27017");

            expect(loggerInfoSpy).toHaveBeenCalledWith(
                "MongoDB connected successfully."
            );
        });

        it("should not call logger.info when mongoose.connect fails", async () => {
            jest.spyOn(mongoose, "connect").mockRejectedValueOnce(
                new MongooseError("Invalid connection string")
            );
            const loggerInfoSpy = jest.spyOn(logger, "info");

            await expect(
                DatabaseService.connect("invalid connection string")
            ).rejects.toThrow();

            expect(loggerInfoSpy).not.toHaveBeenCalled();
        });

        it("should call logger.error with the original error when mongoose.connect fails", async () => {
            const originalError = new MongooseError(
                "Invalid connection string"
            );
            jest.spyOn(mongoose, "connect").mockRejectedValueOnce(
                originalError
            );
            const loggerErrorSpy = jest.spyOn(logger, "error");

            await expect(
                DatabaseService.connect("invalid connection string")
            ).rejects.toThrow();

            expect(loggerErrorSpy).toHaveBeenCalledWith(
                "Error connecting to MongoDB:",
                expect.objectContaining({
                    message: "Invalid connection string",
                })
            );
        });

        it("should throw an Error instance when mongoose.connect fails", async () => {
            jest.spyOn(mongoose, "connect").mockRejectedValueOnce(
                new MongooseError("Invalid connection string")
            );

            await expect(
                DatabaseService.connect("invalid connection string")
            ).rejects.toBeInstanceOf(Error);
        });

        it("should throw 'MongoDB connection failed.' when mongoose.connect fails", async () => {
            jest.spyOn(mongoose, "connect").mockRejectedValueOnce(
                new MongooseError("Invalid connection string")
            );

            await expect(
                DatabaseService.connect("invalid connection string")
            ).rejects.toThrow("MongoDB connection failed.");
        });
    });

    // -- disconnect -----------------------------------------------------------

    describe("disconnect", () => {
        it("should call mongoose.disconnect", async () => {
            const disconnectSpy = jest
                .spyOn(mongoose, "disconnect")
                .mockResolvedValueOnce();

            await DatabaseService.disconnect();

            expect(disconnectSpy).toHaveBeenCalledTimes(1);
        });

        it("should log success when mongoose.disconnect resolves", async () => {
            jest.spyOn(mongoose, "disconnect").mockResolvedValueOnce();
            const loggerInfoSpy = jest.spyOn(logger, "info");

            await DatabaseService.disconnect();

            expect(loggerInfoSpy).toHaveBeenCalledWith(
                "MongoDB disconnected successfully."
            );
        });

        it("should not call logger.info when mongoose.disconnect fails", async () => {
            jest.spyOn(mongoose, "disconnect").mockRejectedValueOnce(
                new MongooseError("Failed to Disconnect!")
            );
            const loggerInfoSpy = jest.spyOn(logger, "info");

            await expect(DatabaseService.disconnect()).rejects.toThrow();

            expect(loggerInfoSpy).not.toHaveBeenCalled();
        });

        it("should call logger.error with the original error when mongoose.disconnect fails", async () => {
            const originalError = new MongooseError("Failed to Disconnect!");
            jest.spyOn(mongoose, "disconnect").mockRejectedValueOnce(
                originalError
            );
            const loggerErrorSpy = jest.spyOn(logger, "error");

            await expect(DatabaseService.disconnect()).rejects.toThrow();

            expect(loggerErrorSpy).toHaveBeenCalledWith(
                "Failed to disconnect from MongoDB.",
                originalError
            );
        });

        it("should throw an Error instance when mongoose.disconnect fails", async () => {
            jest.spyOn(mongoose, "disconnect").mockRejectedValueOnce(
                new MongooseError("Failed to Disconnect!")
            );

            await expect(DatabaseService.disconnect()).rejects.toBeInstanceOf(
                Error
            );
        });

        it("should throw 'MongoDB database failed to disconnect.' when mongoose.disconnect fails", async () => {
            jest.spyOn(mongoose, "disconnect").mockRejectedValueOnce(
                new MongooseError("Failed to Disconnect!")
            );

            await expect(DatabaseService.disconnect()).rejects.toThrow(
                "MongoDB database failed to disconnect."
            );
        });
    });
});
