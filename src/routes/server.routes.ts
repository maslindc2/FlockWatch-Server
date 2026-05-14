import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { DataController } from "../controllers/data.controller";

const router = Router();
const dataController = new DataController();

// Get all flock cases by state
router.get("/flock-cases", async (req: Request, res: Response) => {
    dataController.getAllFlockCases(req, res);
});

router.get(
    "/flock-cases/:stateAbbreviation",
    async (req: Request, res: Response) => {
        dataController.getStateFlockCase(req, res);
    }
);

// Get US Summary statistics
router.get("/us-summary", async (req: Request, res: Response) => {
    dataController.getUSSummary(req, res);
});

// Get all site details
router.get("/sites", async (req: Request, res: Response) => {
    dataController.getAllSites(req, res);
});

// Get site details by status (e.g., "active", "na", "released")
router.get("/sites/status/:status", async (req: Request, res: Response) => {
    dataController.getSitesByStatus(req, res);
});

// Get site details by special ID (e.g., "Elkhart 28", "Skagit 01")
router.get("/sites/:specialId", async (req: Request, res: Response) => {
    dataController.getSiteById(req, res);
});

// Get historical summary
router.get("/historical-summary", async (req: Request, res: Response) => {
    dataController.getHistoricalSummary(req, res);
});

// Get status summary
router.get("/status-summary", async (req: Request, res: Response) => {
    dataController.getStatusSummary(req, res);
});

const dataUpdateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    message: { error: "Too many requests, please try again later" },
    standardHeaders: true,
    legacyHeaders: false,
});

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
