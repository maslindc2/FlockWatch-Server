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
            const allFlockCases =
                await this.flockCasesByStateService.getAllFlockCases();
            logger.http(
                `Received Request at Get All Flock Cases By State: ${req.url}`
            );
            res.json({ data: allFlockCases });
        } catch (error) {
            logger.error("Error fetching Flock Cases By State date:", error);
            res.status(500).json({ error: "Failed to fetch last report date" });
        }
    }
    /**
     * Get a singular state's flock cases, uses the stateAbbreviation to find the matching document
     * @param req Clients request that we received with the State Abbreviation
     * @param res Response that we will use to send the requested state's document retrieved from MongoDB
     */
    public async getStateFlockCase(req: Request, res: Response) {
        const requestedState = req.params.stateAbbreviation;
        try {
            const stateFlockCases =
                await this.flockCasesByStateService.getStateFlockCase(
                    requestedState
                );
            logger.http(
                `Received Request at Get a State's Flock Case: ${req.url}`
            );
            res.json({ data: stateFlockCases });
        } catch (error) {
            logger.error(
                `Error fetching State's flock data. Requested state: ${requestedState} resulted in error:`,
                error
            );
            res.status(500).json({
                error: `"Failed to fetch requested state ${requestedState}"`,
            });
        }
    }

    /**
     * Get the US Summary statistics which contains: totalStatesAffected, totalBirdsAffectedNationwide, totalFlocksAffectedNationwide, totalBackyardFlocksNationwide, totalCommercialFlocksNationwide
     * @param req Clients request that we received
     * @param res Response that we will use to send back data retrieved from the DB
     */
    public async getUSSummary(req: Request, res: Response) {
        try {
            const usSummary =
                await this.usSummaryService.getFormattedUSSummary();

            if (!usSummary) {
                return res.status(404).json({ message: "No US summary found" });
            }

            logger.http(`Received Request at US Summary ${req.url}`);
            res.json({ data: usSummary });
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
            const lastScrapedDate =
                await this.lastReportDateService.getLastScrapedDate();
            logger.http(`Received Request at Last Report Date ${req.url}`);
            res.json({ data: lastScrapedDate });
        } catch (error) {
            logger.error(`Error fetching Last Report Date: ${error}`);
            res.status(500).json({
                error: "Failed to fetch last report date!",
            });
        }
    }
}
export { DataController };
