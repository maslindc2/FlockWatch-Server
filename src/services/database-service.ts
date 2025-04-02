import * as Mongoose from "mongoose";
import { logger } from "../utils/winston-logger";
/**
 * Responsible for connecting us to our MongoDb
 */
class DatabaseService {
    public static async connect(dbConnectionString: string): Promise<void> {
        try {
            await Mongoose.connect(dbConnectionString);
            logger.info("MongoDB connected successfully.");
        } catch (error) {
            logger.error("Error connecting to MongoDB:", error);
            throw new Error("MongoDB connection failed");
        }
    }
}

export { DatabaseService };
