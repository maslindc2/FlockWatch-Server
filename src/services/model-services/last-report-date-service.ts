import { LastReportDateModel } from '../../models/last-report-date-model';

class LastReportDateService {
    public async getLastReportDate() {
        return LastReportDateModel.getModel.find({}).select("-_id -__v");
    }
}
export { LastReportDateService }