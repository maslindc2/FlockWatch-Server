/**
 * Express router that defines all REST API endpoints for the Flock Watch server.
 *
 * Provides read-only GET endpoints for avian influenza surveillance data
 * and a single authenticated POST endpoint used by FlockWatch Scraper to
 * push new data into the database.
 *
 * ---
 *
 * **GET `/flock-cases`**
 *
 * Retrieve avian influenza cases for all US states.
 *
 * Response: `{ data: FlockCasesByState[] }`
 *
 * Each entry contains:
 * - `state_abbreviation` — Two-letter state code
 * - `state` — Full state name
 * - `backyard_flocks` — Number of affected backyard flocks
 * - `commercial_flocks` — Number of affected commercial flocks
 * - `birds_affected` — Total birds affected
 * - `total_flocks` — Total number of affected flocks
 * - `latitude` — State centroid latitude
 * - `longitude` — State centroid longitude
 * - `last_reported_detection` — Date of most recent detection report
 *
 * ---
 *
 * **GET `/flock-cases/:stateAbbreviation`**
 *
 * Retrieve flock cases for a specific US state by its two-letter abbreviation.
 *
 * - `:stateAbbreviation` — Must be exactly two alphabetic characters (case-insensitive), e.g. "CA", "ny".
 *
 * Response: `{ data: FlockCasesByState }`
 *
 * Errors:
 * - `400` — Invalid state abbreviation format
 * - `404` — State not found
 *
 * ---
 *
 * **GET `/us-summary`**
 *
 * Retrieve US-wide summary statistics including all-time totals and rolling
 * period summaries. Period data is keyed by period name for easy access.
 *
 * Response: `{ data: { all_time_totals, period_summaries } }`
 *
 * `all_time_totals` (`AllTimeTotals`):
 * - `total_states_affected` — Number of states with detections
 * - `total_birds_affected` — Cumulative birds affected nationwide
 * - `total_flocks_affected` — Cumulative flocks affected nationwide
 * - `total_backyard_flocks_affected` — Cumulative backyard flocks affected
 * - `total_commercial_flocks_affected` — Cumulative commercial flocks affected
 *
 * `period_summaries` — Object keyed by period name (`"last_7_days"`, `"last_30_days"`,
 * `"last_90_days"`, `"year_to_date"`). Each value has:
 * - `total_birds_affected`
 * - `total_flocks_affected`
 * - `total_backyard_flocks_affected`
 * - `total_commercial_flocks_affected`
 *
 * Error:
 * - `404` — No US summary found
 *
 * ---
 *
 * **GET `/sites`**
 *
 * Retrieve all premises-level site details with optional pagination.
 *
 * Query params:
 * - `?page` — Page number (default: 1)
 * - `?limit` — Results per page (default: 100, max: 500)
 *
 * Response: `{ data: SiteDetails[], total, page, limit, totalPages }`
 *
 * Each `SiteDetails` record:
 * - `special_id` — Unique premises identifier
 * - `county` — County where premises is located
 * - `state` — State where premises is located
 * - `production_type` — Type of production operation
 * - `confirmed_diagnosis_date` — Date of confirmed diagnosis
 * - `status` — Current status (`"active"`, `"released"`, or `"na"`)
 * - `birds_affected` — Number of birds affected at this premises
 *
 * ---
 *
 * **GET `/sites/status/:status`**
 *
 * Retrieve site details filtered by premises status, with optional pagination.
 *
 * - `:status` — One of: `"active"`, `"released"`, `"na"` (case-insensitive)
 *
 * Query params: `?page`, `?limit` (same defaults and limits as GET `/sites`)
 *
 * Response: Paginated result (same structure as GET `/sites`)
 *
 * Error:
 * - `400` — Invalid status value
 *
 * ---
 *
 * **GET `/sites/production-type/:productionType`**
 *
 * Retrieve site details filtered by production type with case-insensitive
 * matching, with optional pagination.
 *
 * - `:productionType` — The production type to search for (e.g. `"Commercial Broiler Breeder"`).
 *   Must be non-empty. URL-encode spaces as `%20`.
 *
 * Query params: `?page`, `?limit` (same defaults and limits as GET `/sites`)
 *
 * Response: Paginated result (same structure as GET `/sites`)
 *
 * Error:
 * - `400` — Invalid (empty) production type
 *
 * ---
 *
 * **GET `/sites/production-types`**
 *
 * Retrieve all distinct production type values found in the collection,
 * sorted alphabetically.
 *
 * Response: `{ data: string[] }`
 *
 * ---
 *
 * **GET `/sites/:specialId`**
 *
 * Retrieve a single site detail by its unique special identifier.
 *
 * - `:specialId` — The premises `special_id`
 *
 * Response: `{ data: SiteDetails }`
 *
 * Errors:
 * - `400` — Invalid (empty) special ID
 * - `404` — Site not found
 *
 * ---
 *
 * **GET `/sites/summary`**
 *
 * Retrieve aggregated site summaries grouped by production type. Each entry
 * includes total sites, total birds affected, and a breakdown by status
 * (active / released / na).
 *
 * Query params:
 * - `?production_type` — Optional. If provided (e.g. `"Commercial Turkey Meat Bird"`),
 *   only summaries matching that production type are returned. Case-insensitive.
 *   URL-encode spaces as `%20`.
 *
 * Response: `{ data: ProductionTypeSummary[] }`
 *
 * Error:
 * - `400` — Invalid (empty) production type query parameter
 *
 * ---
 *
 * **GET `/historical-summary`**
 *
 * Retrieve the all-time historical summary of avian influenza statistics.
 *
 * Response: `{ data: { total_birds_affected_all_time, total_sites_all_time, ... } }`
 *
 * Fields:
 * - `total_birds_affected_all_time` — Cumulative birds affected
 * - `total_sites_all_time` — Total premises ever affected
 * - `total_active_sites` — Currently active premises
 * - `total_released_sites` — Released premises
 * - `total_na_sites` — Premises with non-applicable status
 * - `total_birds_active` — Birds currently in active premises
 *
 * Error:
 * - `404` — No historical summary found
 *
 * ---
 *
 * **GET `/status-summary`**
 *
 * Retrieve the 30-day rolling status summary.
 *
 * Response: `{ data: { sites_confirmed_last_30_days, sites_released_last_30_days, birds_affected_last_30_days } }`
 *
 * Fields:
 * - `sites_confirmed_last_30_days` — Premises confirmed in last 30 days
 * - `sites_released_last_30_days` — Premises released in last 30 days
 * - `birds_affected_last_30_days` — Birds affected in last 30 days
 *
 * Error:
 * - `404` — No status summary found
 *
 * ---
 *
 * **POST `/data-update`**
 *
 * Route FlockWatch Scraper uses to provide new information to the server and
 * update the database. This endpoint is only registered when the `AUTO_UPDATE`
 * environment variable is explicitly set to `"false"`.
 *
 * Authentication: Bearer token via the `Authorization` header. The token must
 * match the server's stored `auth_id` (compared using timing-safe equality).
 *
 * Rate limit: 1 request per 60 seconds.
 *
 * Request body (validated against FlockDataSchema Zod schema):
 * - `flock_cases_by_state` — Array of per-state case data
 * - `us_summary_stats` — US-wide summary statistics
 * - `site_details` — Array of premises-level site details
 * - `historical_summary` — All-time historical summary
 * - `status_summary` — 30-day rolling status summary
 *
 * Success:
 * - `200` — Data validated and persisted
 *
 * Errors:
 * - `400` — Invalid request body (Zod validation failure; includes per-field `details`)
 * - `403` — Bearer token does not match stored `auth_id`
 * - `429` — Rate limit exceeded
 * - `500` — Server-side processing failure
 *
 * @module routes/server
 */
import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { DataController } from "../controllers/data.controller";

const router = Router();
const dataController = new DataController();

router.get("/flock-cases", async (req: Request, res: Response) => {
    dataController.getAllFlockCases(req, res);
});

router.get(
    "/flock-cases/:stateAbbreviation",
    async (req: Request, res: Response) => {
        dataController.getStateFlockCase(req, res);
    }
);

router.get("/us-summary", async (req: Request, res: Response) => {
    dataController.getUSSummary(req, res);
});

router.get("/sites", async (req: Request, res: Response) => {
    dataController.getAllSites(req, res);
});

router.get("/sites/status/:status", async (req: Request, res: Response) => {
    dataController.getSitesByStatus(req, res);
});

router.get(
    "/sites/production-type/:productionType",
    async (req: Request, res: Response) => {
        dataController.getSitesByProductionType(req, res);
    }
);

router.get("/sites/production-types", async (req: Request, res: Response) => {
    dataController.getProductionTypes(req, res);
});

router.get("/sites/summary", async (req: Request, res: Response) => {
    dataController.getProductionTypeSummary(req, res);
});

router.get("/sites/:specialId", async (req: Request, res: Response) => {
    dataController.getSiteById(req, res);
});

router.get("/historical-summary", async (req: Request, res: Response) => {
    dataController.getHistoricalSummary(req, res);
});

router.get("/status-summary", async (req: Request, res: Response) => {
    dataController.getStatusSummary(req, res);
});

/**
 * Rate limiter for the data-update endpoint: max 1 request per 60-second window.
 */
const dataUpdateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 1,
    message: { error: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Conditional POST route registered only when AUTO_UPDATE is "false".
 * See the module-level documentation above for full details.
 */
if (process.env.AUTO_UPDATE && process.env.AUTO_UPDATE === "false") {
    router.post(
        "/data-update",
        dataUpdateLimiter,
        async (req: Request, res: Response) => {
            dataController.receiveUpdatedData(req, res);
        }
    );
}

export default router;
