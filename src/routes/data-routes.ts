import * as path from "path";
import { logger } from "../utils/winston-logger";
import { Router, Request, Response } from "express";
import { DataController } from "../controllers/data-controller";
import { ReadCSV } from "../utils/csv-parser/read-csv";
import { CSVParser } from "../utils/csv-parser/csv-parser";
import { FlockCasesByStateTransformer } from "../utils/csv-parser/transformers/flock-cases-by-state-transformer";

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

router.get("/process-csv", async (req: Request, res: Response) => {
    dataController.updateAllFlockCases(req, res);
});
export default router;
