import { SiteDetails, ProductionTypeSummary } from "./site-details.interface";
import { SiteDetailsModel } from "./site-details.model";
import { logger } from "../../utils/winston-logger";

/**
 * Generic wrapper for paginated query results.
 */
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Service for querying and upserting site detail records.
 * Supports paginated retrieval, filtering by status, single-site lookup by special ID,
 * and bulk upsert with validation.
 */
class SiteDetailsService {
    /**
     * Retrieve all site details without pagination.
     * @returns Array of all SiteDetails documents.
     */
    public async getAllSiteDetails() {
        return SiteDetailsModel.getModel
            .find({})
            .select("-_id -__v")
            .lean<SiteDetails[]>();
    }

    /**
     * Retrieve site details with pagination.
     * @param page Page number (1-indexed, defaults to 1).
     * @param limit Items per page (defaults to 100, max 500).
     * @returns PaginatedResult with data, total count, and pagination metadata.
     */
    public async getAllSiteDetailsPaginated(
        page: number = 1,
        limit: number = 100
    ): Promise<PaginatedResult<SiteDetails>> {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            SiteDetailsModel.getModel
                .find({})
                .select("-_id -__v")
                .skip(skip)
                .limit(limit)
                .lean<SiteDetails[]>(),
            SiteDetailsModel.getModel.countDocuments({}),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Retrieve a single site detail by its unique special identifier.
     * @param specialId The site's special identifier (e.g. "Elkhart 28").
     * @returns The matching SiteDetails document, or null if not found.
     */
    public async getSiteDetailById(specialId: string) {
        return SiteDetailsModel.getModel
            .findOne({ special_id: specialId })
            .select("-_id -__v")
            .lean<SiteDetails | null>();
    }

    /**
     * Retrieve all site details matching a given status.
     * @param status Status to filter by ("active", "released", or "na").
     * @returns Array of matching SiteDetails documents.
     */
    public async getSitesByStatus(status: string) {
        return SiteDetailsModel.getModel
            .find({ status })
            .select("-_id -__v")
            .lean<SiteDetails[]>();
    }

    /**
     * Retrieve site details filtered by status with pagination.
     * @param status Status to filter by ("active", "released", or "na").
     * @param page Page number (1-indexed, defaults to 1).
     * @param limit Items per page (defaults to 100, max 500).
     * @returns PaginatedResult with data, total count, and pagination metadata.
     */
    public async getSitesByStatusPaginated(
        status: string,
        page: number = 1,
        limit: number = 100
    ): Promise<PaginatedResult<SiteDetails>> {
        const skip = (page - 1) * limit;
        const filter = { status: status.toLowerCase() };

        const [data, total] = await Promise.all([
            SiteDetailsModel.getModel
                .find(filter)
                .select("-_id -__v")
                .skip(skip)
                .limit(limit)
                .lean<SiteDetails[]>(),
            SiteDetailsModel.getModel.countDocuments(filter),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Escape special regex characters to prevent regex injection.
     * @param str The raw user-provided string to escape.
     * @returns The escaped string safe for use in a RegExp constructor.
     */
    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    /**
     * Retrieve site details filtered by production_type using case-insensitive matching,
     * with pagination.
     * @param productionType The production type to search for (e.g. "Commercial Broiler Breeder").
     * @param page Page number (1-indexed, defaults to 1).
     * @param limit Items per page (defaults to 100, max 500).
     * @returns PaginatedResult with matching site details.
     */
    public async getSitesByProductionTypePaginated(
        productionType: string,
        page: number = 1,
        limit: number = 100
    ): Promise<PaginatedResult<SiteDetails>> {
        const skip = (page - 1) * limit;
        const filter = {
            production_type: {
                $regex: new RegExp(
                    `^${this.escapeRegex(productionType)}$`,
                    "i"
                ),
            },
        };

        const [data, total] = await Promise.all([
            SiteDetailsModel.getModel
                .find(filter)
                .select("-_id -__v")
                .skip(skip)
                .limit(limit)
                .lean<SiteDetails[]>(),
            SiteDetailsModel.getModel.countDocuments(filter),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Retrieve all distinct production_type values from the collection,
     * sorted alphabetically.
     * @returns Array of unique production type strings.
     */
    public async getDistinctProductionTypes(): Promise<string[]> {
        const types = await SiteDetailsModel.getModel
            .distinct("production_type")
            .exec();
        return types.sort();
    }

    /**
     * Retrieve aggregated summaries grouped by production_type, with an optional
     * case-insensitive filter for a specific production type. Uses MongoDB aggregation
     * to compute total site counts, total birds affected, and a per-status breakdown
     * in a single round trip.
     * @param productionType Optional production type to filter by. When omitted,
     *                       summaries for all production types are returned.
     * @returns Array of ProductionTypeSummary objects sorted alphabetically by production_type.
     */
    public async getProductionTypeSummary(
        productionType?: string
    ): Promise<ProductionTypeSummary[]> {
        const pipeline: any[] = [];

        if (productionType) {
            pipeline.push({
                $match: {
                    production_type: {
                        $regex: new RegExp(
                            `^${this.escapeRegex(productionType)}$`,
                            "i"
                        ),
                    },
                },
            });
        }

        pipeline.push(
            {
                $group: {
                    _id: "$production_type",
                    total_sites: { $sum: 1 },
                    total_birds_affected: { $sum: "$birds_affected" },
                    active_sites: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "active"] },
                                1,
                                0,
                            ],
                        },
                    },
                    released_sites: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "released"] },
                                1,
                                0,
                            ],
                        },
                    },
                    na_sites: {
                        $sum: {
                            $cond: [
                                { $eq: ["$status", "na"] },
                                1,
                                0,
                            ],
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    production_type: "$_id",
                    total_sites: 1,
                    total_birds_affected: 1,
                    by_status: {
                        active: "$active_sites",
                        released: "$released_sites",
                        na: "$na_sites",
                    },
                },
            },
            { $sort: { production_type: 1 } }
        );

        return SiteDetailsModel.getModel
            .aggregate<ProductionTypeSummary>(pipeline)
            .exec();
    }

    /**
     * Validate a single site entry before writing it to the database.
     * Checks special_id, birds_affected, and status fields.
     * @param entry The site entry to validate.
     * @returns true if the entry passes all validation checks.
     */
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

    /**
     * Upsert an array of site details using a bulkWrite operation.
     * Invalid entries are skipped and logged.
     * @param siteData Array of site details to persist.
     */
    public async upsertSiteDetails(siteData: SiteDetails[]) {
        try {
            const operations = [];

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

                operations.push({
                    updateOne: {
                        filter: { special_id: sanitizedEntry.special_id },
                        update: { $set: sanitizedEntry },
                        upsert: true,
                    },
                });
            }

            if (operations.length > 0) {
                await SiteDetailsModel.getModel.bulkWrite(operations, {
                    ordered: false,
                });
            }
        } catch (error) {
            logger.error(`Failed to update site details: ${error}`);
            throw new Error(`Failed to update site details: ${error}`);
        }
    }
}
export { SiteDetailsService };
