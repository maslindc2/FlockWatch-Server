import { Router, Request, Response } from "express";
import { DataController } from "../controllers/data-controller";

const router = Router();
const dataController = new DataController();

// Get all flock cases by state
router.get("/flock-cases", async (req: Request, res: Response) => {
    dataController.getAllFlockCases(req, res);
});

router.get("/flock-cases/:stateAbbreviation", async (req: Request, res: Response) => {
    dataController.getStateFlockCase(req, res);
});

// Get US Summary statistics
router.get("/us-summary", async (req: Request, res: Response) => {
    dataController.getUSSummary(req, res);
});

export default router;
