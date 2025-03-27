import { logger } from "../utils/winston-logger";
import { Router, Request, Response } from "express";
import { DataController } from "../controllers/data-controller";
import { UpdateDataService } from "../services/update-data-service";
import { LastReportDateService } from "../services/model-services/last-report-date-service";

const router = Router();
const dataController = new DataController();

// Get all flock cases by state
router.get("/flock-cases", async (req: Request, res: Response) => {
    dataController.getAllFlockCases(req, res);
});

// Get the last report date
router.get("/last-report-date", async (req: Request, res: Response) => {
    dataController.getLastReportDate(req, res);
});

// Get US Summary statistics
router.get("/us-summary", async (req: Request, res: Response) => {
    dataController.getUSSummary(req, res);
});

// TODO: Remove this route as it will be a job that runs at some point
router.get("/update-data", async (req: Request, res: Response) => {
    logger.http(`Received Request from ${req.url}`)
    const scraperDataService = new UpdateDataService();
    const lastReportDateService = new LastReportDateService();

    // Get the authID from our model
    const modelInfo = await lastReportDateService.getLastReportDate();
    // Fetch the latest avian influenza state data
    const data = await scraperDataService.fetchLatestFlockData(modelInfo[0].authID);
    
    // TODO: Remove this as it won't be a route
    res.send(data);
    
    // Generate new authID
    await lastReportDateService.createOrUpdateLastReportDate();
});
export default router;
