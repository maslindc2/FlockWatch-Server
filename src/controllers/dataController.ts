import {Request, Response} from 'express';
import { FlockCasesByStateModel } from '../models/FlockCasesByStateModel';
import { LastReportDateModel } from '../models/LastReportDateModel';
import { USSummaryModel } from '../models/USSummaryModel';

class DataController {
    public getStatus(req: Request, res: Response){
        res.status(200).json({message: "We are alive and ready to serve!"})
    }
    public static async getSummary() {
        return USSummaryModel.model.find({}).select("-_id -__v");
    }
    public static async getLastReportDate() {
        return LastReportDateModel.model.find({}).select("-_id -__v");
    }
    public static async getFlockCasesByState() {
        return FlockCasesByStateModel.model.find({}).select("-_id -__v");
    }
    
}
export {DataController}