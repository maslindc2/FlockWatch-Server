import { FlockCasesByStateService } from "../services/model-services/flock-cases-by-state-service";
import { LastReportDateService } from "../services/model-services/last-report-date-service";
import { USSummaryService } from "../services/model-services/us-summary-service";
import { logger } from "../utils/winston-logger";
import { Request, Response } from "express";

class DataController {
    // Define the service instances that the data controller will use
    private flockCasesByStateService: FlockCasesByStateService;
    private lastReportDateService: LastReportDateService;
    private usSummaryService: USSummaryService;

    // Create the service instances that Data Controller will use
    constructor() {
        this.flockCasesByStateService = new FlockCasesByStateService();
        this.lastReportDateService = new LastReportDateService();
        this.usSummaryService = new USSummaryService();
    }
    /**
     * Get all Avian Influenza cases in the United States
     * @param req Clients request that we received
     * @param res Response that we will use to send back data retrieved from MongoDB
     */
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
    /**
     * Get the US Summary statistics which contains: totalStatesAffected, totalBirdsAffectedNationwide, totalFlocksAffectedNationwide, totalBackyardFlocksNationwide, totalCommercialFlocksNationwide
     * @param req Clients request that we received
     * @param res Response that we will use to send back data retrieved from the DB
     */
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
    /**
     * Get the Last Scraped Date which tells us when we last ran Flock Watch Scraping, coincides with how old our data is too
     * @param req Clients request that we received
     * @param res Response that we will use to send back data retrieved from the DB
     */
    public async getLastScrapedDate(req: Request, res: Response) {
        try {
            const data = await this.lastReportDateService.getLastScrapedDate();
            logger.http(`Received Request at Last Report Date ${req.url}`);
            res.json(data);
        } catch (error) {
            logger.error(`Error fetching Last Report Date: ${error}`);
            res.status(500).json({
                error: "Failed to fetch last report date!",
            });
        }
    }
}
export { DataController };
