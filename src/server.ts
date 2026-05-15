import * as dotenv from "dotenv";
import { App } from "./app";
import { logger } from "./utils/winston-logger";

/** Load environment variables from .env file. */
dotenv.config();

/**
 * The port the Express server will listen on.
 * Configurable via the PORT environment variable; defaults to 8080.
 */
const PORT: number = Number(process.env.PORT) || 8080;

/** MongoDB connection string from environment variables. */
const mongoDBConnection = process.env.MONGODB_URI;

if (!mongoDBConnection) {
    throw new Error("MONGODB_URI is not defined in the environment variables!");
}

process.on("uncaughtException", (error) => {
    logger.error(`Uncaught Exception: ${error}`);
    process.exit(1);
});

process.on("unhandledRejection", (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
});

/** Bootstrap the application and start listening for incoming requests. */
const server = new App().app;
server.listen(PORT, () => logger.info(`Starting server on port: ${PORT}`));
