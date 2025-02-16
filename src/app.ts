import express, { Application, Request, Response, NextFunction } from "express";
import { FlockCasesByStateModel } from "./models/FlockCasesByStateModel";
import { LastReportDateModel } from "./models/LastReportDateModel";
import { USSummaryModel } from "./models/USSummaryModel";
import scraperRoutes from "./routes/scraperRoutes";
import { logger } from "./utils/winstonLogger";
import { DatabaseService } from "./services/DatabaseService";

class App {
    public app: Application;
    public FlockCasesByState: FlockCasesByStateModel;
    public LastReportDate: LastReportDateModel;
    public USSummaryModel: USSummaryModel;

    constructor() {
        this.app = express();
        this.middleware();

        // Initialize models (no need to pass DB connection here anymore)
        this.FlockCasesByState = new FlockCasesByStateModel();
        this.LastReportDate = new LastReportDateModel();
        this.USSummaryModel = new USSummaryModel();

        // Connect to DB
        DatabaseService.connect(process.env.MONGODB_URI!);
    }

    private middleware(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use("/scraper", scraperRoutes);
        this.app.use("/", (req: Request, res: Response, next: NextFunction): void => {
            res.json({ message: "Nothing here but us Chickens" });
        });
    }
}

export { App };
