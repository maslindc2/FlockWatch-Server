import express, { Application, Request, Response, NextFunction } from "express";
import dataRoutes from "./routes/data-routes";
import { DatabaseService } from "./services/database-service";
import { LastReportDateService } from "./services/model-services/last-report-date-service";
import { logger } from "./utils/winston-logger";
import { FlockDataSyncService } from "./services/scraping-services/flock-data-sync-service";

class App {
    // Stores the express app instance
    public app: Application;
    // Stores our last report date service used for syncing the db
    private lastReportDateService: LastReportDateService;

    private metadata: any;

    /**
     * Setting up the App instance
     * @param lastReportDateService used for dependency injection when integration testing the app service
     */
    constructor(
    ) {
        this.app = express();
        this.middleware();
        this.serverStart();
    }

    // Define the middleware that we will be using
    private middleware(): void {
        // Accepting json
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        // Setting CORS policies for the server
        this.app.use((req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            next();
        });

        // Setting /data routes for requesting flock data
        this.app.use("/data", this.attachMetadata, dataRoutes);

        // Set the root url to return the default message
        this.app.get(
            "/",
            (req: Request, res: Response, next: NextFunction): void => {
                res.json({ message: "Nothing here but us Chickens" });
            }
        );

        this.app.use((req: Request, res: Response): void => {
            res.status(404).json({
                error: "Not Found",
                message: "The requested endpoint does not exist",
            });
        });
    }
    // Start the server instance be connecting to the DB and check if we are out of date
    private async serverStart(): Promise<void> {
        try {
            // Connect to MongoDB
            await DatabaseService.connect(process.env.MONGODB_URI!);

            // Initialize the DB which will check if we starting from a fresh DB instance or not
            await this.lastReportDateService.initializeLastReportDate();

            this.metadata =
                await this.lastReportDateService.getLastScrapedDate();

            // Call sync data to check if we are out of date and if so request new data from flock watch scraping
            await this.syncData();

            // Update the metadata to the latest scrape date after syncing
            this.metadata =
                await this.lastReportDateService.getLastScrapedDate();

            // Log that we are ready
            logger.info(`FlockWatch Server is ready!`);
        } catch (error) {
            logger.error(`Failed to start FlockWatch Server: ${error}`);
            if (process.env.NODE_ENV !== "test") {
                process.exit(1);
            }
        }
    }

    private attachMetadata = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const originalData = res.json.bind(res);
        res.json = (body) => {
            if (typeof body === "object" && body !== null) {
                body.metadata = this.metadata;
            }
            return originalData(body);
        };
        next();
    };

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
