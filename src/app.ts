import express, { Application, Request, Response, NextFunction } from "express";
import dataRoutes from "./routes/data-routes";
import { DatabaseService } from "./services/database-service";
import { LastReportDateService } from "./services/model-services/last-report-date-service";
import { logger } from "./utils/winston-logger";
import { FlockDataSyncService } from "./services/flock-data-sync-service";

class App {
    // Stores the express app instance
    public app: Application;
    // Stores our last report date service used for syncing the db
    private lastReportDateService: LastReportDateService;

    /**
     * Setting up the App instance
     * @param lastReportDateService used for dependency injection when integration testing the app service
     */
    constructor(
        lastReportDateService: LastReportDateService = new LastReportDateService()
    ) {
        this.app = express();
        this.lastReportDateService = lastReportDateService;
        this.middleware();
        this.serverStart();
    }

    // Define the middleware that we will be using
    private middleware(): void {
        // Accepting json
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        // Setting /data routes for requesting flock data
        this.app.use("/data", dataRoutes);
        // Set the root url to be the default message
        this.app.use(
            "/",
            (req: Request, res: Response, next: NextFunction): void => {
                res.json({ message: "Nothing here but us Chickens" });
            }
        );
    }
    // Start the server instance be connecting to the DB and check if we are out of date
    private async serverStart(): Promise<void> {
        try {
            // Connect to MongoDB
            await DatabaseService.connect(process.env.MONGODB_URI!);
            // Initialize the DB which will check if we starting from a fresh DB instance or not
            await this.lastReportDateService.initializeLastReportDate();
            // Call sync data to check if we are out of date and if so request new data from flock watch scraping
            this.syncData();
            // Log that we are ready
            logger.info(`FlockWatch Server is ready!`);
        } catch (error) {
            logger.error(`Failed to start FlockWatch Server: ${error}`);
            process.exit(1);
        }
    }
    private async syncData(): Promise<void> {
        // Try to get data if we can't or fail to process it log it as an error
        // Allows us to still serve data that we have in our DB if the scraping system is down
        try {
            // Create a flock data sync service instance
            const flockDataSync = new FlockDataSyncService();
            // Call sync if outdated to check if we are out of date and if we are automatically fetch new data
            await flockDataSync.syncIfOutdated();
        } catch (error) {
            logger.error(error);
        }
    }
}

export { App };
