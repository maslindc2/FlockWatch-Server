import { Router, Request, Response } from "express";
import { DataController } from "../controllers/dataController";
import { logger } from "../utils/winstonLogger";

const router = Router();

// Get all flock cases by state
router.get("/flock-cases", async (req: Request, res: Response) => {
    try {
        const data = await DataController.getFlockCasesByState();
        logger.http(`Received Request at Flock Cases By State: ${req.url}`)
        res.json(data);
    } catch (error) {
        logger.error("Error fetching flock cases:", error);
        res.status(500).json({ error: "Failed to fetch flock cases" });
    }
});

// Get the last report date
router.get("/last-report-date", async (req: Request, res: Response) => {
    try {
        const data = await DataController.getLastReportDate();
        logger.http(`Received Request at Last Report Date: ${req.url}`)
        res.json(data);
    } catch (error) {
        logger.error("Error fetching last report date:", error);
        res.status(500).json({ error: "Failed to fetch last report date" });
    }
});

// Get US Summary statistics
router.get("/us-summary", async (req: Request, res: Response) => {
    try {
        const data = await DataController.getSummary();
        logger.http(`Received Request at US Summary: ${req.url}`)
        res.json(data);
    } catch (error) {
        logger.error("Error fetching US summary:", error);
        res.status(500).json({ error: "Failed to fetch US summary" });
    }
});
export default router;
