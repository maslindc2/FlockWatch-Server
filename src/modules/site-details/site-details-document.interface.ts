import Mongoose from "mongoose";
import { SiteDetails } from "./site-details.interface";

interface SiteDetailsDocument extends SiteDetails, Mongoose.Document {}
export type { SiteDetailsDocument };
