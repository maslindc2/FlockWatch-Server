import { USSummaryService } from "../modules/us-summary/us-summary.service";
import { logger } from "../utils/winston-logger";
import { Request, Response } from "express";
import { FlockCasesByStateService } from "../modules/flock-cases-by-state/flock-cases-by-state.service";
import { LastReportDateService } from "../modules/last-report-date/last-report-date.service";
import { SiteDetailsService } from "../modules/site-details/site-details.service";
import { HistoricalSummaryService } from "../modules/historical-summary/historical-summary.service";
import { StatusSummaryService } from "../modules/status-summary/status-summary.service";
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
    private siteDetailsService: SiteDetailsService;
    private historicalSummaryService: HistoricalSummaryService;
    private statusSummaryService: StatusSummaryService;

    // Create the service instances that Data Controller will use
    constructor() {
        this.flockCasesByStateService = new FlockCasesByStateService();
        this.lastReportDateService = new LastReportDateService();
        this.usSummaryService = new USSummaryService();
        this.siteDetailsService = new SiteDetailsService();
        this.historicalSummaryService = new HistoricalSummaryService();
        this.statusSummaryService = new StatusSummaryService();
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
            if (!requestedState || !/^[A-Za-z]{2}$/.test(requestedState)) {
                res.status(400).json({
                    error: "Invalid state abbreviation format",
                });
                return;
            }
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
     * Get all site details with pagination
     * @param req Clients request that we received (supports ?page and ?limit query params)
     * @param res Response that we will use to send back data retrieved from MongoDB
     */
    public async getAllSites(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = Math.min(
                parseInt(req.query.limit as string, 10) || 100,
                500
            );

            const result =
                await this.siteDetailsService.getAllSiteDetailsPaginated(
                    page,
                    limit
                );

            logger.http(`Received Request at Get All Sites: ${req.url}`);
            res.json(result);
        } catch (error) {
            logger.error("Error fetching site details:", error);
            res.status(500).json({ error: "Failed to fetch site details" });
        }
    }

    /**
     * Get a single site detail by special ID
     * @param req Clients request that we received with the special ID
     * @param res Response that we will use to send back data retrieved from MongoDB
     */
    public async getSiteById(req: Request, res: Response) {
        const specialId = req.params.specialId;
        try {
            if (!specialId || specialId.trim().length === 0) {
                res.status(400).json({ error: "Invalid special ID" });
                return;
            }
            const site =
                await this.siteDetailsService.getSiteDetailById(specialId);
            if (!site) {
                return res.status(404).json({ message: "Site not found" });
            }
            logger.http(`Received Request at Get Site By ID: ${req.url}`);
            res.json({ data: site });
        } catch (error) {
            logger.error(`Error fetching site by ID ${specialId}:`, error);
            res.status(500).json({ error: "Failed to fetch site details" });
        }
    }

    /**
     * Get site details by status (active, released, na) with pagination
     * @param req Clients request that we received with the status parameter (supports ?page and ?limit query params)
     * @param res Response that we will use to send back data retrieved from MongoDB
     */
    public async getSitesByStatus(req: Request, res: Response) {
        const status = req.params.status;
        try {
            const validStatuses = ["active", "released", "na"];
            if (!status || !validStatuses.includes(status.toLowerCase())) {
                res.status(400).json({
                    error: `Invalid status. Valid values: ${validStatuses.join(", ")}`,
                });
                return;
            }
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = Math.min(
                parseInt(req.query.limit as string, 10) || 100,
                500
            );

            const result =
                await this.siteDetailsService.getSitesByStatusPaginated(
                    status,
                    page,
                    limit
                );

            logger.http(`Received Request at Get Sites By Status: ${req.url}`);
            res.json(result);
        } catch (error) {
            logger.error(`Error fetching sites by status ${status}:`, error);
            res.status(500).json({ error: "Failed to fetch site details" });
        }
    }

    /**
     * Get the historical summary
     * @param req Clients request that we received
     * @param res Response that we will use to send back data retrieved from MongoDB
     */
    public async getHistoricalSummary(req: Request, res: Response) {
        try {
            const historicalSummary =
                await this.historicalSummaryService.getHistoricalSummary();
            if (!historicalSummary) {
                return res
                    .status(404)
                    .json({ message: "No historical summary found" });
            }
            logger.http(`Received Request at Historical Summary: ${req.url}`);
            res.json({ data: historicalSummary });
        } catch (error) {
            logger.error(`Error fetching historical summary: ${error}`);
            res.status(500).json({
                error: "Failed to fetch historical summary",
            });
        }
    }

    /**
     * Get the status summary
     * @param req Clients request that we received
     * @param res Response that we will use to send back data retrieved from MongoDB
     */
    public async getStatusSummary(req: Request, res: Response) {
        try {
            const statusSummary =
                await this.statusSummaryService.getStatusSummary();
            if (!statusSummary) {
                return res
                    .status(404)
                    .json({ message: "No status summary found" });
            }
            logger.http(`Received Request at Status Summary: ${req.url}`);
            res.json({ data: statusSummary });
        } catch (error) {
            logger.error(`Error fetching status summary: ${error}`);
            res.status(500).json({ error: "Failed to fetch status summary" });
        }
    }

    public async receiveUpdatedData(req: Request, res: Response) {
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
            if (receivedAuthID === expectedAuthID) {
                // Create our build us summary service
                const buildUSSummary = new BuildUSSummary();
                // Create our Flock Watch Update Service
                const fwUpdateService = new FlockDataUpdateService();
                // Get the array containing all the states' infection information
                const flock_cases_by_state: FlockCasesByState[] =
                    req.body.flock_cases_by_state;
                // Get the period summaries
                const period_summaries: PeriodSummary[] =
                    req.body.period_summaries;
                // Use the flock cases by state and period summaries to create the us summary stats
                // Contains: All Time Totals and Last 30 Day infections
                const us_summary_stats = buildUSSummary.createUSSummaryData(
                    flock_cases_by_state,
                    period_summaries
                );
                // Assemble the object we will use for updating the database
                const dataForDB: FlockData = {
                    flock_cases_by_state: flock_cases_by_state,
                    us_summary_stats: us_summary_stats,
                    site_details: req.body.site_details || [],
                    historical_summary: req.body.historical_summary || {
                        total_birds_affected_all_time: 0,
                        total_sites_all_time: 0,
                        total_active_sites: 0,
                        total_released_sites: 0,
                        total_na_sites: 0,
                        total_birds_active: 0,
                    },
                    status_summary: req.body.status_summary || {
                        sites_confirmed_last_30_days: 0,
                        sites_released_last_30_days: 0,
                        birds_affected_last_30_days: 0,
                    },
                };
                // Update the database using the new data we received from the scraper system
                await fwUpdateService.applyUpdate(dataForDB);
            } else {
                logger.error(`Invalid Auth ID received!`);
                res.sendStatus(403);
                return;
            }
            res.sendStatus(200);
        } catch (error) {
            res.sendStatus(500);
        }
    }
}
export { DataController };
