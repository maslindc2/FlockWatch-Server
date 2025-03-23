import * as path from "path";
import { logger } from "../utils/winston-logger";
import { Router, Request, Response } from "express";
import { DataController } from "../controllers/data-controller";

const router = Router();
const dataController = new DataController();

// Get all flock cases by state
router.get("/flock-cases", async (req: Request, res: Response) => {
    dataController.getAllFlockCases(req, res);
});

// Get the last report date
router.get("/last-report-date", async (req: Request, res: Response) => {
    dataController.getLastReportDate(req, res);
});

// Get US Summary statistics
router.get("/us-summary", async (req: Request, res: Response) => {
    dataController.getUSSummary(req, res);
});

router.get("/update-data", async (req: Request, res: Response) => {
    logger.http(`Received Request from ${req.url}`)
    try {
        await fetch("http://localhost:6767/scraper/process-data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                authID: "80801"
            })
        })
        .then(async (scraperRes) => {
            if (scraperRes.status == 200){
                logger.http(`Received data from scraping service at ${req.url}`);
                const jsonResponse = await scraperRes.json();
                if (jsonResponse.length === 0) {
                    logger.error("Received JSON array of length 0 from Scraping Service");
                    //TODO: Remove this as it won't be on a route in production
                    res.sendStatus(500);
                }else{
                    res.json(jsonResponse);
                }
            }else{
                logger.error(`Failed to update data received status ${scraperRes.status}`)
                //TODO: Remove this as it won't be on a route in production
                res.sendStatus(scraperRes.status);
            }
        });
    } catch (error) {
        logger.error(`Failed to make request to scraper ${error}`);
        res.sendStatus(500);
    }
    
});
export default router;
