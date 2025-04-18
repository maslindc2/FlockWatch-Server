import dotenv from "dotenv";
import { IUSSummaryStats } from "../../../src/interfaces/i-us-summary-stats";
import { USSummaryService } from "../../../src/services/model-services/us-summary-service";
import { DatabaseService } from "../../../src/services/database-service";
import { logger } from "../../../src/utils/winston-logger";
import mongoose, { ConnectOptions, Mongoose, MongooseError } from "mongoose";

dotenv.config();

describe("DatabaseService Integration", () => {

    it("should fail to connect to mongoDB and call our logger with the message that we failed to connect", async () => {
        // Spy on logger info and error, info should not be called only error
        const loggerInfoSpy = jest.spyOn(logger, "info");
        const loggerErrorSpy = jest.spyOn(logger, "error");
    
        // Use a spy to mock the mongoose.connect function and reject the promise to throw an error
        const mongooseConnectSpy = jest
          .spyOn(mongoose, 'connect')
          .mockImplementationOnce(() => {
            return Promise.reject(new MongooseError("Invalid connection string"));
          });
        
        // Catch should catch the error and throw MongoDB connection failed
        await expect(DatabaseService.connect("invalid connection string"))
          .rejects.toThrow("MongoDB connection failed.");
        
        // info should not be called as this is an error!
        expect(loggerInfoSpy).not.toHaveBeenCalled();
        // error should be called with the expected message
        expect(loggerErrorSpy).toHaveBeenCalledWith(
            "Error connecting to MongoDB:",
            expect.objectContaining({ message: "Invalid connection string" })
        );
        
        // Restore functionality
        mongooseConnectSpy.mockRestore();
    });
    
    
    it("should connect and disconnect from MongoDB and call our logger with the message disconnected successfully", async () => {
        // Create a spy for our logger to check if we log that we connected
        const loggerInfoSpy = jest.spyOn(logger, "info");
        
        const mongooseConnectSpy = jest
        .spyOn<Mongoose, 'connect'>(mongoose, 'connect')
        .mockImplementationOnce((uris: string, options?: ConnectOptions, callback?: (err?: MongooseError) => void) => {
            return Promise.resolve(mongoose);
        });

        const mongooseDisconnectSpy = jest
        .spyOn<Mongoose, 'disconnect'>(mongoose, 'disconnect')
        .mockImplementationOnce(() => {
            return Promise.resolve();
        });
        
        await DatabaseService.connect("mongodb://localhost:27017");

        expect(mongooseConnectSpy).toHaveBeenCalledWith(
            "mongodb://localhost:27017"
        );
        
        expect(loggerInfoSpy).toHaveBeenCalledWith("MongoDB connected successfully.");
        
        await DatabaseService.disconnect();
        
        expect(mongooseDisconnectSpy).toHaveBeenCalled();

        expect(loggerInfoSpy).toHaveBeenCalledWith("MongoDB disconnected successfully.");
    });

});