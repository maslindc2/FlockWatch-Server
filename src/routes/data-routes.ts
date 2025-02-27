import * as path from "path";
import { logger } from "../utils/winston-logger";
import { Router, Request, Response } from "express";
import { DataController } from "../controllers/data-controller";
import {
    CSVParser,
    FlockCasesByStateStrategy,
} from "../utils/csv-parser/index";

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
    const strategy = new FlockCasesByStateStrategy();
    const parser = new CSVParser(strategy);
    const csvFilePath = path.resolve(
        __dirname,
        "../../data/Map Comparisons.csv"
    );
    logger.silly(`Parsing CSV File at ${csvFilePath}`);
    const csvData = parser.readCSVFile(csvFilePath, "utf-16le")
    const customHeaders = [
        "State Abbreviation",
        "State Name",
        "Backyard Flocks",
        "Birds Affected",
        "Color",
        "Commercial Flocks",
        "Last Reported Detection Text",
        "Total Flocks",
        "State Boundary",
        "State Label",
        "Latitude (generated)",
        "Longitude (generated)"
    ];
    const parsedData = parser.parseCSV(csvData, "\t", 2, customHeaders)
    const dataFiltered = parsedData.filter((row: { [x: string]: string }) => row["State Name"]?.trim() && row["Birds Affected"] !== "0");
    //const transformedData = strategy.transformData(parsedData);
    res.status(200).send(dataFiltered);
});
export default router;
