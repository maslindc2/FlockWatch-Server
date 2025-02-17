import * as Mongoose from "mongoose";
import { logger } from "../utils/winston-logger";

class DatabaseService {
    private static isConnected: boolean = false;
    public static async connect(dbConnectionString: string): Promise<void> {
        if (this.isConnected) {
            logger.warn("MongoDB is already connected.");
            return;
        }
        try {
            await Mongoose.connect(dbConnectionString);
            this.isConnected = true;
            logger.info("MongoDB connected successfully.");
        } catch (error) {
            logger.error("Error connecting to MongoDB:", error);
            throw new Error("MongoDB connection failed");
        }
    }

    public static disconnect(): void {
        Mongoose.disconnect().then(() => {
            this.isConnected = false;
            logger.info("MongoDB disconnected successfully.");
        });
    }
}

export { DatabaseService };