import * as dotenv from "dotenv";
import { App } from "./app";
import { logger } from "./utils/winston-logger";

// Load env variables
dotenv.config();

// Assign the port number for the service, you can modify the PORT using the env otherwise it defaults to 5050
const PORT: number = Number(process.env.PORT) || 5050;
// Store the mongoDBConnection from env file
const mongoDBConnection = process.env.MONGODB_URI;
// If it's not defined throw an error
if (!mongoDBConnection) {
    throw new Error("MONGODB_URI is not defined in the environment variables!");
}
// Start the App
const server = new App().app;
// Start listening for requests
server.listen(PORT, () => logger.info(`Starting server on port: ${PORT}`));
