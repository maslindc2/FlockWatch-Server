import mongoose from "mongoose";
import { logger } from "../utils/winston-logger";

class DatabaseService {
    /**
     * This function is used for connecting to our MongoDB server
     * @param dbConnectionString we use the connection string that we got from server.ts
     */
    public static async connect(dbConnectionString: string): Promise<void> {
        try {
            await mongoose.connect(dbConnectionString);
            logger.info("MongoDB connected successfully.");
        } catch (error) {
            logger.error("Error connecting to MongoDB:", error);
            throw new Error("MongoDB connection failed.");
        }
    }
    /**
     * This function is primarily used for integration testing, while it does exist here, we have no intentions on using it normally
     */
    public static async disconnect(): Promise<void> {
        try {
            await mongoose.disconnect();
            logger.info("MongoDB disconnected successfully.");
        } catch (error) {
            logger.error("Failed to disconnect from MongoDB.", error);
            throw new Error(`MongoDB database failed to disconnect.`);
        }
    }
}

export { DatabaseService };
