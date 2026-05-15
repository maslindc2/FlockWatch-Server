import Mongoose from "mongoose";
import { SiteDetails } from "./site-details.interface";

/**
 * Mongoose document interface for SiteDetails, combining the base interface with Mongoose.Document methods.
 */
interface SiteDetailsDocument extends SiteDetails, Mongoose.Document {}
export type { SiteDetailsDocument };
