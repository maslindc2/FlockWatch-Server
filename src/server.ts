/**
 * Entry point for the FlockWatch server. Bootstraps the Express app, connects
 * to MongoDB, and begins accepting HTTP requests.
 *
 * ---
 *
 * **Initialization sequence:**
 * 1. Load environment variables from `.env` file via `dotenv`
 * 2. Read `PORT` (default: `8080`) and `MONGODB_URI` (required)
 * 3. Register process-level error handlers:
 *    - `uncaughtException` — Logs and exits with code 1
 *    - `unhandledRejection` — Logs the rejection reason
 * 4. Instantiate {@link App} and start listening
 *
 * ---
 *
 * **Required environment variables:**
 * - `MONGODB_URI` — MongoDB connection string
 *
 * **Optional environment variables:**
 * - `PORT` — Server port (default: `8080`)
 * - `NODE_ENV` — Environment mode (`"development"` for permissive CORS)
 * - `AUTO_UPDATE` — `"true"` enables periodic data sync from the scraper
 * - `FRONTEND_DOMAIN` — Allowed CORS origin in production
 * - `SCRAPER_DOMAIN` — Allowed CORS origin for the scraper in production
 *
 * @module server
 */
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
