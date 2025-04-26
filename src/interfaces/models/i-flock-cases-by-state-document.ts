import Mongoose from "mongoose";
import { IFlockCasesByState } from "../i-flock-cases-by-state";
// Since we already define the IFlockCasesByState we can reuse it to make our document interface
interface IFlockCasesByStateDocument
    extends IFlockCasesByState,
        Mongoose.Document {}
export { IFlockCasesByStateDocument };
