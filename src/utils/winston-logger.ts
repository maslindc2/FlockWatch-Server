import winston from "winston";
import * as dotenv from "dotenv";
dotenv.config();

export const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    level: process.env.LOG_LEVEL || "error",
    format: winston.format.cli(),
    transports: [new winston.transports.Console()],
});
