import { FlockCasesByStateService } from "../services/model-services/flock-cases-by-state-service";
import { LastReportDateService } from "../services/model-services/last-report-date-service";
import { USSummaryService } from "../services/model-services/us-summary-service";
import { logger } from "../utils/winston-logger";
import { Request, Response } from "express";

//TODO: Remove when FlockWatch-Scraping has been built
import path from "path";
import { ReadCSV } from "../utils/csv-parser/read-csv";
import { CSVParser } from "../utils/csv-parser/csv-parser";
import { FlockCasesByStateTransformer } from "../utils/csv-parser/transformers/flock-cases-by-state-transformer";

class DataController {
    private flockCasesByStateService: FlockCasesByStateService;
    private lastReportDateService: LastReportDateService;
    private usSummaryService: USSummaryService;

    constructor() {
        this.flockCasesByStateService = new FlockCasesByStateService();
        this.lastReportDateService = new LastReportDateService();
        this.usSummaryService = new USSummaryService();
    }

    public async getAllFlockCases(req: Request, res: Response) {
        try {
            const data = await this.flockCasesByStateService.getAllFlockCases();
            logger.http(`Received Request at Flock Cases By State: ${req.url}`);
            res.json(data);
        } catch (error) {
            logger.error("Error fetching Flock Cases By State date:", error);
            res.status(500).json({ error: "Failed to fetch last report date" });
        }
    }

    public async getUSSummary(req: Request, res: Response) {
        try {
            const data = await this.usSummaryService.getUSSummary();
            logger.http(`Received Request at US Summary ${req.url}`);
            res.json(data);
        } catch (error) {
            logger.error(`Error fetching US Summary: ${error}`);
            res.status(500).json({ error: "Failed to US Summary!" });
        }
    }

    public async getLastReportDate(req: Request, res: Response) {
        try {
            const data = await this.lastReportDateService.getLastReportDate();
            logger.http(`Received Request at US Summary ${req.url}`);
            res.json(data);
        } catch (error) {
            logger.error(`Error fetching US Summary: ${error}`);
            res.status(500).json({
                error: "Failed to fetch last report date!",
            });
        }
    }

    // TODO: This will be moved to FlockWatch-Scraping which is in charge of the webscrapers and is an entirely separate system, it's here for testing routes at the moment
    public async updateAllFlockCases(req: Request, res: Response) {
        try {
            logger.http(`Received Request at CSV Processing Route ${req.url}`);
            const csvFilePath = path.resolve(
                __dirname,
                "../../data/Map Comparisons.csv"
            );
            logger.silly(`Parsing CSV File at ${csvFilePath}`);
            const csvData = ReadCSV.readCSVFile(csvFilePath, "utf-16le")
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
            const parsedData = CSVParser.parseCSV(csvData, "\t", 2, customHeaders)
            const dataFiltered = parsedData.filter((row: { [x: string]: string }) => row["State Name"]?.trim() && row["Birds Affected"] !== "0");
            const transformedData = FlockCasesByStateTransformer.transformData(dataFiltered);
            res.json(transformedData);
        } catch (error) {
            logger.error(`Error processing CSV Data: ${error}`)
            res.status(500).json({
                error: "Failed to process CSV Data!",
            });
        }   
    }
}
export { DataController };
