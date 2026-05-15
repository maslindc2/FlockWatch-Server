import express, { Application, Request, Response, NextFunction } from "express";
import helmet from "helmet";
import compression from "compression";
import serverRoutes from "./routes/server.routes";
import { logger } from "./utils/winston-logger";
import { LastReportDateService } from "./modules/last-report-date/last-report-date.service";
import cors from "cors";
import { FlockDataSyncService } from "./modules/data-updating/flock-data-sync.service";
import { DatabaseService } from "./modules/database/database.service";

/**
 * Main application class that configures Express middleware, CORS, routes,
 * and handles server lifecycle including database connection and data syncing.
 */
class App {
    /** The underlying Express application instance. */
    public app: Application;
    /** Service for tracking the last time data was synced from the scraper. */
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

    /**
     * Register all Express middleware: security headers, compression, JSON parsing,
     * CORS policies (development vs production), routes, and 404 handler.
     */
    private middleware(): void {
        // Security headers
        this.app.use(helmet());
        // Compress all responses (gzip/brotli)
        this.app.use(compression());
        // Accepting json
        this.app.use(express.json({ limit: "1mb" }));
        this.app.use(express.urlencoded({ extended: false, limit: "1mb" }));
        // Set CORS policies depending on what ENV mode we are in
        if (process.env.NODE_ENV === "development") {
            // Alert that we are in development mode for the CORS policies
            logger.info(
                "Currently in development mode, CORS allows all origins!"
            );
            this.app.use(
                cors({
                    origin: "*",
                    methods: ["GET", "POST"],
                    allowedHeaders: ["Content-Type"],
                })
            );
        } else {
            // Use the production CORS rules
            this.app.use(
                "/data",
                cors({
                    origin: (origin, callback) => {
                        // Allow requests that don't have an origin
                        if (!origin) {
                            callback(null, true);
                            return;
                        }
                        //Allowed origins array which houses each domain
                        const allowedOrigins = [process.env.FRONTEND_DOMAIN];
                        if (allowedOrigins.includes(origin)) {
                            callback(null, true);
                            return;
                        }
                        callback(new Error("Not allowed by CORS"));
                    },
                    // Only allow GET methods
                    methods: ["GET", "POST"],
                    allowedHeaders: ["Content-Type"],
                })
            );
        }

        // Setting /data routes for requesting flock data
        this.app.use("/data", this.attachMetadata, serverRoutes);

        // Set the root url to return the default message
        this.app.get(
            "/",
            (req: Request, res: Response, _next: NextFunction): void => {
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

    /**
     * Connect to MongoDB, initialize the last report date, optionally sync data
     * from the scraping service if AUTO_UPDATE is enabled, then mark the server as ready.
     */
    private async serverStart(): Promise<void> {
        try {
            // Connect to MongoDB
            await DatabaseService.connect(process.env.MONGODB_URI!);

            // Initialize the DB which will check if we starting from a fresh DB instance or not
            await this.lastReportDateService.initializeLastReportDate();

            // If we are having the server keep track of updating the information set this variable to true
            if (
                process.env.AUTO_UPDATE &&
                (process.env.AUTO_UPDATE === "true" ||
                    process.env.AUTO_UPDATE === "True" ||
                    process.env.AUTO_UPDATE === "TRUE")
            ) {
                logger.info(
                    "Auto Update is Enabled! We will request new information from the Scraper!"
                );
                // Call sync data to check if we are out of date and if so request new data from flock watch scraping
                await this.syncData();
            } else {
                logger.info(
                    "Auto Update Data is Disabled, /data/data-update route is enabled, scraper will send new info to this route"
                );
                logger.info(
                    "Scraper system will be responsible for knowing when to update!"
                );
            }
            // Log that we are ready
            logger.info(`FlockWatch Server is ready!`);
        } catch (error) {
            logger.error(`Failed to start FlockWatch Server: ${error}`);
            if (process.env.NODE_ENV !== "test") {
                process.exit(1);
            }
        }
    }

    /**
     * Middleware that attaches the last scraped date metadata to every JSON response
     * under the `/data` routes.
     */
    private attachMetadata = (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const originalData = res.json.bind(res);
        res.json = ((body: unknown) => {
            return (async () => {
                if (typeof body === "object" && body !== null) {
                    (body as Record<string, unknown>).metadata =
                        await this.lastReportDateService.getLastScrapedDate();
                }
                return originalData(body);
            })();
        }) as unknown as typeof res.json;
        next();
    };

    /**
     * Check whether the stored data is outdated and, if so, request fresh data
     * from the scraping service. Errors are logged but do not prevent the server
     * from starting so it can continue serving stale data.
     */
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
