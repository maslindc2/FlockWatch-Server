import dotenv from "dotenv";
import { DatabaseService } from "../../../src/services/database-service";
import { logger } from "../../../src/utils/winston-logger";
import mongoose, { ConnectOptions, Mongoose, MongooseError } from "mongoose";

dotenv.config();

describe("DatabaseService Unit", () => {
    it("should call our logger with the message that we failed to connect when we fail to connect to MongoDB", async () => {
        // Spy on logger info and error, info should not be called only error
        const loggerErrorSpy = jest.spyOn(logger, "error");

        // Use a spy to mock the mongoose.connect function and reject the promise to throw an error
        const mongooseConnectSpy = jest
            .spyOn(mongoose, "connect")
            .mockImplementationOnce(() => {
                return Promise.reject(
                    new MongooseError("Invalid connection string")
                );
            });

        // Catch should catch the error and throw MongoDB connection failed
        await expect(
            DatabaseService.connect("invalid connection string")
        ).rejects.toThrow("MongoDB connection failed.");

        // error should be called with the expected message
        expect(loggerErrorSpy).toHaveBeenCalledWith(
            "Error connecting to MongoDB:",
            expect.objectContaining({ message: "Invalid connection string" })
        );
        mongooseConnectSpy.mockRestore();
    });

    it("should throw an error and call our logger with the message that we failed to disconnect when we fail to disconnect from MongoDB", async () => {
        // Spy on logger info and error, info should not be called only error
        const loggerErrorSpy = jest.spyOn(logger, "error");

        // Use a spy to mock the mongoose.connect function and reject the promise to throw an error
        const mongooseConnectSpy = jest
            .spyOn(mongoose, "disconnect")
            .mockImplementationOnce(() => {
                return Promise.reject(
                    new MongooseError("Failed to Disconnect!")
                );
            });

        // Catch should catch the error and throw MongoDB connection failed
        await expect(DatabaseService.disconnect()).rejects.toThrow(
            "MongoDB database failed to disconnect."
        );

        // error should be called with the expected message
        expect(loggerErrorSpy).toHaveBeenCalledWith(
            "Failed to disconnect from MongoDB.",
            new MongooseError("Failed to Disconnect!")
        );
        mongooseConnectSpy.mockRestore();
    });

    it("should call our logger with the message disconnected successfully when we disconnect from MongoDB successfully", async () => {
        // Create a spy for our logger to check if we log that we connected
        const loggerInfoSpy = jest.spyOn(logger, "info");
        // Create a spy for the mongoose connect function and mock the implementation to resolve a promise
        const mongooseConnectSpy = jest
            .spyOn<Mongoose, "connect">(mongoose, "connect")
            .mockImplementationOnce(
                (
                    uris: string,
                    options?: ConnectOptions,
                    callback?: (err?: MongooseError) => void
                ) => {
                    return Promise.resolve(mongoose);
                }
            );

        // Create a spy for disconnect function and mock the implementation to resolve a promise
        const mongooseDisconnectSpy = jest
            .spyOn<Mongoose, "disconnect">(mongoose, "disconnect")
            .mockImplementationOnce(() => {
                return Promise.resolve();
            });

        // Call connect function with fake URI
        await DatabaseService.connect("mongodb://localhost:27017");
        // Expect that we called connect with our fake URI
        expect(mongooseConnectSpy).toHaveBeenCalledWith(
            "mongodb://localhost:27017"
        );
        // Expect info logger to report that we connected successfully
        expect(loggerInfoSpy).toHaveBeenCalledWith(
            "MongoDB connected successfully."
        );

        // Disconnect from the service
        await DatabaseService.disconnect();
        // Expect that there we called the Mongoose disconnect function
        expect(mongooseDisconnectSpy).toHaveBeenCalled();
        // Expect the spy to report that we disconnected from MongoDB
        expect(loggerInfoSpy).toHaveBeenCalledWith(
            "MongoDB disconnected successfully."
        );
        // Restore implementation
        mongooseConnectSpy.mockRestore();
    });
});
