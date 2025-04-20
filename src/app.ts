import express, { Application, Request, Response, NextFunction } from "express";
import dataRoutes from "./routes/data-routes";
import { DatabaseService } from "./services/database-service";
import { LastReportDateService } from "./services/model-services/last-report-date-service";
import { logger } from "./utils/winston-logger";
import { FlockDataSyncService } from "./services/flock-data-sync-service";

class App {
    public app: Application;
    private lastReportDateService: LastReportDateService;

    constructor(
        lastReportDateService: LastReportDateService = new LastReportDateService()
    ) {
        this.app = express();
        this.lastReportDateService = lastReportDateService;
        this.middleware();
        this.serverStart();
    }

    private middleware(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use("/data", dataRoutes);
        this.app.use(
            "/",
            (req: Request, res: Response, next: NextFunction): void => {
                res.json({ message: "Nothing here but us Chickens" });
            }
        );
    }

    private async serverStart(): Promise<void> {
        try {
            await DatabaseService.connect(process.env.MONGODB_URI!);
            await this.lastReportDateService.initializeLastReportDate();
            //const flockDataSync = new FlockDataSyncService();
            //await flockDataSync.syncIfOutdated();

            logger.info(`FlockWatch Server is ready!`);
        } catch (error) {
            logger.error(`Failed to start FlockWatch Server: ${error}`);
            process.exit(1);
        }
    }
}

export { App };
