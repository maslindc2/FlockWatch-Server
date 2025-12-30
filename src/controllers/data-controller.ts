import { USSummaryService } from "../modules/us-summary/us-summary.service";
import { logger } from "../utils/winston-logger";
import { Request, Response } from "express";
import { FlockCasesByStateService } from "../modules/flock-cases-by-state/flock-cases-by-state.service";
import { LastReportDateService } from "../modules/last-report-date/last-report-date.service";
import { FlockDataUpdateService } from "../modules/data-updating/flock-data-update.service";
import { BuildUSSummary } from "../modules/data-updating/build-us-summary.service";
import { FlockData } from "../modules/data-updating/flock-data.interface";
import { FlockCasesByState } from "../modules/flock-cases-by-state/flock-cases-by-state.interface";
import { PeriodSummary } from "../modules/us-summary/us-summary-stats.interface";


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
    /**
     * 
     * @param req 
     * @param res 
     */
    public async receiveUpdatedData(req: Request, res: Response){
        try {
            // Extract the auth header
            const authHeader = req.headers.authorization;
            // Slice out the auth ID that was sent
            const receivedAuthID = authHeader?.startsWith("Bearer ")
                ? authHeader.slice(7).trim()
                : null;
            // Get the object containing the auth ID from the database
            const authIDObj = await this.lastReportDateService.getAuthID();
            // Get the expected auth ID
            const expectedAuthID = authIDObj?.auth_id;
            // Check if the received auth ID is equal to the expected auth ID
            if(receivedAuthID === expectedAuthID){
                // Create our build us summary service
                const buildUSSummary = new BuildUSSummary();
                // Create our Flock Watch Update Service
                const fwUpdateService = new FlockDataUpdateService();
                // Get the array containing all the states' infection information
                const flock_cases_by_state:FlockCasesByState[] = req.body.flock_cases_by_state;
                // Get the period summaries
                const period_summaries:PeriodSummary[] = req.body.period_summaries;
                // Use the flock cases by state and period summaries to create the us summary stats
                // Contains: All Time Totals and Last 30 Day infections
                const us_summary_stats = buildUSSummary.createUSSummaryData(flock_cases_by_state, period_summaries);
                
                // Assemble the object we will use for updating the database
                const dataForDB:FlockData = {
                    flock_cases_by_state: flock_cases_by_state,
                    us_summary_stats: us_summary_stats
                }
                // Send our assembled data and apply the update
                await fwUpdateService.applyUpdate(dataForDB);
            }else{
                logger.error(
                    `Invalid Auth ID from IP ${req.ip}, who sent the auth ID ${receivedAuthID}!`
                );
                res.sendStatus(403);
            }
            res.sendStatus(200);
        } catch (error) {
            res.sendStatus(500);
        }
    }
}
export { DataController };
