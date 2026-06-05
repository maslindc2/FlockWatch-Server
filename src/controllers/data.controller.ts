import { USSummaryService } from "../modules/us-summary/us-summary.service";
import { logger } from "../utils/winston-logger";
import { Request, Response } from "express";
import { FlockCasesByStateService } from "../modules/flock-cases-by-state/flock-cases-by-state.service";
import { LastReportDateService } from "../modules/last-report-date/last-report-date.service";
import { SiteDetailsService } from "../modules/site-details/site-details.service";
import { HistoricalSummaryService } from "../modules/historical-summary/historical-summary.service";
import { StatusSummaryService } from "../modules/status-summary/status-summary.service";
import { OutbreakTimelineService } from "../modules/outbreak-timeline/outbreak-timeline.service";
import { FlockDataUpdateService } from "../modules/data-updating/flock-data-update.service";
import { BuildUSSummary } from "../modules/data-updating/build-us-summary.service";
import { FlockData } from "../modules/data-updating/flock-data.interface";
import { timingSafeEqual } from "crypto";
import { FlockDataSchema } from "../validation/flock-data.schema";
import { ZodError } from "zod";

class DataController {
    // Define the service instances that the data controller will use
    private flockCasesByStateService: FlockCasesByStateService;
    private lastReportDateService: LastReportDateService;
    private usSummaryService: USSummaryService;
    private siteDetailsService: SiteDetailsService;
    private historicalSummaryService: HistoricalSummaryService;
    private statusSummaryService: StatusSummaryService;
    private outbreakTimelineService: OutbreakTimelineService;

    // Create the service instances that Data Controller will use
    constructor() {
        this.flockCasesByStateService = new FlockCasesByStateService();
        this.lastReportDateService = new LastReportDateService();
        this.usSummaryService = new USSummaryService();
        this.siteDetailsService = new SiteDetailsService();
        this.historicalSummaryService = new HistoricalSummaryService();
        this.statusSummaryService = new StatusSummaryService();
        this.outbreakTimelineService = new OutbreakTimelineService();
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
            res.status(500).json({ error: "Failed to fetch flock cases" });
        }
    }
    /**
     * Get a singular state's flock cases, uses the stateAbbreviation to find the matching document
     * @param req Clients request that we received with the State Abbreviation
     * @param res Response that we will use to send the requested state's document retrieved from MongoDB
     */
    public async getStateFlockCase(req: Request, res: Response) {
        const requestedState = req.params.stateAbbreviation as string;
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
            if (!stateFlockCases) {
                return res.status(404).json({ message: "State not found" });
            }
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
        const specialId = req.params.specialId as string;
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
        const status = req.params.status as string;
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
                    status.toLowerCase(),
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
     * Get site details by production type with case-insensitive matching and pagination
     * @param req Clients request that we received with the production type parameter (supports ?page and ?limit query params)
     * @param res Response that we will use to send back data retrieved from MongoDB
     */
    public async getSitesByProductionType(req: Request, res: Response) {
        const productionType = req.params.productionType as string;
        try {
            if (!productionType || productionType.trim().length === 0) {
                res.status(400).json({ error: "Invalid production type" });
                return;
            }
            const page = parseInt(req.query.page as string, 10) || 1;
            const limit = Math.min(
                parseInt(req.query.limit as string, 10) || 100,
                500
            );

            const result =
                await this.siteDetailsService.getSitesByProductionTypePaginated(
                    productionType,
                    page,
                    limit
                );

            logger.http(
                `Received Request at Get Sites By Production Type: ${req.url}`
            );
            res.json(result);
        } catch (error) {
            logger.error(
                `Error fetching sites by production type ${productionType}:`,
                error
            );
            res.status(500).json({ error: "Failed to fetch site details" });
        }
    }

    /**
     * Get all distinct production type values
     * @param req Clients request that we received
     * @param res Response that we will use to send back data retrieved from MongoDB
     */
    public async getProductionTypes(req: Request, res: Response) {
        try {
            const productionTypes =
                await this.siteDetailsService.getDistinctProductionTypes();

            logger.http(`Received Request at Get Production Types: ${req.url}`);
            res.json({ data: productionTypes });
        } catch (error) {
            logger.error("Error fetching production types:", error);
            res.status(500).json({
                error: "Failed to fetch production types",
            });
        }
    }

    /**
     * Get aggregated site summaries grouped by production type, with an optional
     * query parameter to filter by a specific production type.
     * @param req Clients request that we received (supports ?production_type query param)
     * @param res Response that we will use to send back data retrieved from MongoDB
     */
    public async getProductionTypeSummary(req: Request, res: Response) {
        try {
            const productionType = req.query.production_type as
                | string
                | undefined;

            if (
                productionType !== undefined &&
                productionType.trim().length === 0
            ) {
                res.status(400).json({ error: "Invalid production type" });
                return;
            }

            const result =
                await this.siteDetailsService.getProductionTypeSummary(
                    productionType || undefined
                );

            logger.http(
                `Received Request at Get Production Type Summary: ${req.url}`
            );
            res.json({ data: result });
        } catch (error) {
            logger.error("Error fetching production type summary:", error);
            res.status(500).json({
                error: "Failed to fetch production type summary",
            });
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

    /**
     * Get outbreak timeline data grouped into time-bucketed periods.
     * Supports ?granularity=week|month|year (default: month).
     * @param req Clients request that we received with optional ?granularity query param.
     * @param res Response containing the timeline periods and metadata.
     */
    public async getSiteTimeline(req: Request, res: Response) {
        try {
            const granularity = (req.query.granularity as string) || "month";

            const validGranularities = ["week", "month", "year"];
            if (!validGranularities.includes(granularity)) {
                res.status(400).json({
                    error: `Invalid granularity. Valid values: ${validGranularities.join(", ")}`,
                });
                return;
            }

            const result =
                await this.outbreakTimelineService.getTimeline(granularity);

            logger.http(`Received Request at Site Timeline: ${req.url}`);
            res.json({ data: result });
        } catch (error) {
            logger.error("Error fetching outbreak timeline:", error);
            res.status(500).json({
                error: "Failed to fetch outbreak timeline",
            });
        }
    }

    /**
     * Receive updated data pushed from the scraping service.
     * Validates the Bearer auth_id, assembles a FlockData payload, and applies it.
     * Returns 403 if the auth_id does not match, 500 on processing errors.
     * @param req Request containing flock data in the body and auth in the Authorization header.
     * @param res Response used to convey success (200), forbidden (403), or error (500).
     */
    public async receiveUpdatedData(req: Request, res: Response) {
        try {
            // 1. Extract and verify the Bearer token (unchanged from before,
            //    but now uses timingSafeEqual -- shown here for completeness).
            const authHeader = req.headers.authorization;
            const receivedAuthID = authHeader?.startsWith("Bearer ")
                ? authHeader.slice(7).trim()
                : null;

            const authIDObj = await this.lastReportDateService.getAuthID();
            if (!authIDObj) {
                logger.error("No auth ID found in database");
                res.sendStatus(500);
                return;
            }
            const expectedAuthID = authIDObj.auth_id;

            if (
                !receivedAuthID ||
                !expectedAuthID ||
                receivedAuthID.length !== expectedAuthID.length ||
                !timingSafeEqual(
                    Buffer.from(receivedAuthID),
                    Buffer.from(expectedAuthID)
                )
            ) {
                logger.error("Invalid Auth ID received!");
                res.sendStatus(403);
                return;
            }

            // 2. Validate and parse the request body against the Zod schema.
            //    .parse() throws a ZodError on failure; the catch block below
            //    returns 400 with structured error details.
            const parsed = FlockDataSchema.parse(req.body);

            // 3. Build the US summary from the validated, typed data.
            const buildUSSummary = new BuildUSSummary();
            const us_summary_stats = buildUSSummary.createUSSummaryData(
                parsed.flock_cases_by_state,
                parsed.period_summaries
            );

            // 4. Assemble and persist.
            const dataForDB: FlockData = {
                flock_cases_by_state: parsed.flock_cases_by_state,
                us_summary_stats,
                site_details: parsed.site_details,
                historical_summary: parsed.historical_summary,
                status_summary: parsed.status_summary,
            };

            const fwUpdateService = new FlockDataUpdateService();
            await fwUpdateService.applyUpdate(dataForDB);

            res.sendStatus(200);
        } catch (error) {
            if (error instanceof ZodError) {
                // Return the first validation failure to the caller.
                // Do NOT log the full req.body -- it may contain large payloads.
                logger.warn(
                    `receiveUpdatedData: schema validation failed — ${error.issues.length} issue(s)`
                );
                res.status(400).json({
                    error: "Invalid request body",
                    details: error.issues.map((issue) => ({
                        path: issue.path.join("."),
                        message: issue.message,
                    })),
                });
                return;
            }

            logger.error(`receiveUpdatedData unexpected error: ${error}`);
            res.sendStatus(500);
        }
    }
}
export { DataController };
