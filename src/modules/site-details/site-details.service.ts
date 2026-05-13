import { SiteDetails } from "./site-details.interface";
import { SiteDetailsModel } from "./site-details.model";
import { logger } from "../../utils/winston-logger";

class SiteDetailsService {
    public async getAllSiteDetails() {
        return SiteDetailsModel.getModel
            .find({})
            .select("-_id -__v")
            .lean<SiteDetails[]>();
    }

    public async getSiteDetailById(specialId: string) {
        return SiteDetailsModel.getModel
            .findOne({ special_id: specialId })
            .select("-_id -__v")
            .lean<SiteDetails | null>();
    }

    public async getSitesByStatus(status: string) {
        return SiteDetailsModel.getModel
            .find({ status })
            .select("-_id -__v")
            .lean<SiteDetails[]>();
    }

    private isValidSiteEntry(entry: SiteDetails): boolean {
        if (
            !entry.special_id ||
            typeof entry.special_id !== "string" ||
            entry.special_id.length === 0
        ) {
            logger.warn(
                `Rejected site entry with invalid special_id: "${entry.special_id}"`
            );
            return false;
        }

        if (
            typeof entry.birds_affected !== "number" ||
            !isFinite(entry.birds_affected)
        ) {
            logger.warn(
                `Rejected site entry for ${entry.special_id}: invalid birds_affected`
            );
            return false;
        }

        const validStatuses = ["active", "released", "na"];
        if (
            !entry.status ||
            typeof entry.status !== "string" ||
            !validStatuses.includes(entry.status.toLowerCase())
        ) {
            logger.warn(
                `Rejected site entry for ${entry.special_id}: invalid status "${entry.status}"`
            );
            return false;
        }

        return true;
    }

    public async upsertSiteDetails(siteData: SiteDetails[]) {
        try {
            for (const entry of siteData) {
                if (!this.isValidSiteEntry(entry)) {
                    continue;
                }

                const sanitizedEntry: SiteDetails = {
                    special_id: entry.special_id,
                    county: entry.county,
                    state: entry.state,
                    production_type: entry.production_type,
                    confirmed_diagnosis_date: entry.confirmed_diagnosis_date,
                    status: entry.status.toLowerCase(),
                    birds_affected: entry.birds_affected,
                };

                await SiteDetailsModel.getModel.findOneAndUpdate(
                    { special_id: sanitizedEntry.special_id },
                    { $set: sanitizedEntry },
                    { upsert: true }
                );
            }
        } catch (error) {
            logger.error(
                `Failed to update site details: ${error}`
            );
            throw new Error(
                `Failed to update site details: ${error}`
            );
        }
    }
}
export { SiteDetailsService };
