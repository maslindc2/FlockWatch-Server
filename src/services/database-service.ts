import mongoose from "mongoose";
import { logger } from "../utils/winston-logger";
/**
 * Responsible for connecting us to our MongoDb
 */
class DatabaseService {
    public static async connect(dbConnectionString: string): Promise<void> {
        try {
            await mongoose.connect(dbConnectionString);
            logger.info("MongoDB connected successfully.");
        } catch (error) {
            logger.error("Error connecting to MongoDB:", error);
            throw new Error("MongoDB connection failed.");
        }
    }
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
