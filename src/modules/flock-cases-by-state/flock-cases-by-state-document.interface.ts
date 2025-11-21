import Mongoose from "mongoose";
import { FlockCasesByState } from "./flock-cases-by-state.interface";
// Since we already define the IFlockCasesByState we can reuse it to make our document interface
interface FlockCasesByStateDocument
    extends FlockCasesByState,
        Mongoose.Document {}
export { FlockCasesByStateDocument };
