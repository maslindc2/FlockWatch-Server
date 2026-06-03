/**
 * Represents a single site (premises) with avian influenza details.
 * Each site has a unique special_id and tracks its status, location, and impact.
 */
interface SiteDetails {
    special_id: string;
    county: string;
    state: string;
    production_type: string;
    confirmed_diagnosis_date: Date;
    /** Current status: "active", "released", or "na". */
    status: string;
    birds_affected: number;
}

/**
 * Aggregated summary of site details grouped by production type.
 * Contains total counts, total birds affected, and a breakdown by status.
 */
interface ProductionTypeSummary {
    production_type: string;
    total_sites: number;
    total_birds_affected: number;
    by_status: {
        active: number;
        released: number;
        na: number;
    };
}

export type { SiteDetails, ProductionTypeSummary };
