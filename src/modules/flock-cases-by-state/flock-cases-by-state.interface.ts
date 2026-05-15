/**
 * Represents avian influenza case data for a single US state or territory.
 * Maps to a row in the "Map Comparisons.csv" source data (excluding State Label and Color columns).
 */
interface FlockCasesByState {
    state_abbreviation: string;
    state: string;
    backyard_flocks: number;
    commercial_flocks: number;
    birds_affected: number;
    total_flocks: number;
    latitude: number;
    longitude: number;
    last_reported_detection: Date;
}
export type { FlockCasesByState };
