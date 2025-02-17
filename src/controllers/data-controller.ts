import { FlockCasesByStateService } from '../services/model-services/flock-cases-by-state-service';
import { LastReportDateService } from '../services/model-services/last-report-date-service';
import { USSummaryService } from '../services/model-services/us-summary-service';
import { logger } from '../utils/winston-logger';
import {Request, Response} from 'express';

class DataController {
    private flockCasesByStateService: FlockCasesByStateService;
    private lastReportDateService: LastReportDateService;
    private usSummaryService: USSummaryService;

    constructor() {
        this.flockCasesByStateService = new FlockCasesByStateService();
        this.lastReportDateService = new LastReportDateService();
        this.usSummaryService = new USSummaryService();
    }

    public async getAllFlockCases(req: Request, res: Response){
        try {
            const data = await this.flockCasesByStateService.getAllFlockCases();
            logger.http(`Received Request at Flock Cases By State: ${req.url}`)
            res.json(data);
        } catch (error) {
            logger.error("Error fetching Flock Cases By State date:", error);
            res.status(500).json({ error: "Failed to fetch last report date" });
        }
    }
    
    public async getUSSummary(req: Request, res: Response) {
        try {
            const data = await this.usSummaryService.getUSSummary();
            logger.http(`Received Request at US Summary ${req.url}`);
            res.json(data);
        } catch (error) {
            logger.error(`Error fetching US Summary: ${error}`)
            res.status(500).json({error: "Failed to fetch flock cases!"})
        }
    }
    
    public async getLastReportDate(req: Request, res: Response) {
        try {
            const data = await this.lastReportDateService.getLastReportDate();
            logger.http(`Received Request at US Summary ${req.url}`);
            res.json(data);
        } catch (error) {
            logger.error(`Error fetching US Summary: ${error}`)
            res.status(500).json({error: "Failed to fetch flock cases!"})
        }
    }
}
export {DataController}