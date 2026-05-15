import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { DataController } from "../controllers/data.controller";

const router = Router();
const dataController = new DataController();

/** GET /flock-cases — Retrieve avian influenza cases for all US states. */
router.get("/flock-cases", async (req: Request, res: Response) => {
    dataController.getAllFlockCases(req, res);
});

/** GET /flock-cases/:stateAbbreviation — Retrieve flock cases for a specific state by its two-letter abbreviation. */
router.get(
    "/flock-cases/:stateAbbreviation",
    async (req: Request, res: Response) => {
        dataController.getStateFlockCase(req, res);
    }
);

/** GET /us-summary — Retrieve US-wide summary statistics (all-time totals and rolling periods). */
router.get("/us-summary", async (req: Request, res: Response) => {
    dataController.getUSSummary(req, res);
});

/** GET /sites — Retrieve all site details with optional pagination (?page, ?limit). */
router.get("/sites", async (req: Request, res: Response) => {
    dataController.getAllSites(req, res);
});

/**
 * GET /sites/status/:status — Retrieve site details filtered by status.
 * Valid statuses: "active", "released", "na".
 */
router.get("/sites/status/:status", async (req: Request, res: Response) => {
    dataController.getSitesByStatus(req, res);
});

/** GET /sites/:specialId — Retrieve a single site detail by its special identifier. */
router.get("/sites/:specialId", async (req: Request, res: Response) => {
    dataController.getSiteById(req, res);
});

/** GET /historical-summary — Retrieve the historical summary of all-time bird flu statistics. */
router.get("/historical-summary", async (req: Request, res: Response) => {
    dataController.getHistoricalSummary(req, res);
});

/** GET /status-summary — Retrieve the 30-day status summary (confirmed, released, birds affected). */
router.get("/status-summary", async (req: Request, res: Response) => {
    dataController.getStatusSummary(req, res);
});

/**
 * Rate limiter for the data-update endpoint: max 5 requests per 60-second window.
 */
const dataUpdateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * POST /data-update — Receive updated data pushed from the scraping service.
 * Only registered when AUTO_UPDATE is explicitly set to "false".
 * Protected by a rate limiter to prevent abuse.
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
