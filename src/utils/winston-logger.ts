import winston from "winston";
import * as dotenv from "dotenv";
dotenv.config();

/**
 * Application-wide Winston logger instance.
 * Log level is controlled by the LOG_LEVEL environment variable (defaults to "error").
 * Outputs colorized log messages to the console.
 */
export const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    level: process.env.LOG_LEVEL || "error",
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message }) => {
            return `${level}: ${message}`;
        })
    ),
    transports: [new winston.transports.Console()],
});
