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
export type { SiteDetails };
