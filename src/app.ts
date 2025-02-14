import express, { Application, Request, Response, NextFunction } from "express";
import { FlockCasesByStateModel } from "./model/FlockCasesByStateModel";
import { LastReportDateModel } from "./model/LastReportDateModel";
import { USSummaryModel } from "./model/USSummaryModel";
import scraperRoutes from "./routes/scraperRoutes";
import { logger } from "./utils/winstonLogger";

class App {
    public app: Application;
    public FlockCasesByState: FlockCasesByStateModel;
    public LastReportDate: LastReportDateModel;
    public USSummaryModel: USSummaryModel;

    constructor(mongoDBConnection: string) {
        this.app = express();
        this.middleware();
        this.FlockCasesByState = new FlockCasesByStateModel(mongoDBConnection);
        this.LastReportDate = new LastReportDateModel(mongoDBConnection);
        this.USSummaryModel = new USSummaryModel(mongoDBConnection);
    }

    private middleware(): void {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use("/scraper", scraperRoutes);
        this.app.use(
            "/",
            (req: Request, res: Response, next: NextFunction): void => {
                res.json({ message: "Nothing here but us Chickens" });
            }
        );
    }
}

export { App };
