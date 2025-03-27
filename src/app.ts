import express, { Application, Request, Response, NextFunction } from "express";
import dataRoutes from "./routes/data-routes";
import { DatabaseService } from "./services/database-service";
import { LastReportDateService } from "./services/model-services/last-report-date-service";
import { logger } from "./utils/winston-logger";

class App {
    public app: Application;
    constructor() {
        this.app = express();
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
            const lastReportDateService = new LastReportDateService();
            await lastReportDateService.initializeLastReportDate();
            logger.info(`FlockWatch Server is ready!`);
        } catch (error) {
            logger.error(`Failed to start FlockWatch Server: ${error}`);
            process.exit(1);
        }
    }
}

export { App };
