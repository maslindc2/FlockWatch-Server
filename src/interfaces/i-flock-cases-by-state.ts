// Data type for each state and the required attributes
// This interface is for flock cases for each individual state
// CSV to use is "Map Comparisons.csv"
interface IFlockCasesByState {
    state_abbreviation: string; // State abbreviation used on the Frontend for each state
    state: string; // Full state name
    backyard_flocks: number; // Number of backyard flocks that have been infected
    commercial_flocks: number; // Number of commercial flocks that have been infected
    birds_affected: number; // Total number of birds infected
    total_flocks: number; // Total number of flocks infected
    latitude: number; // Latitude of state might be used when generating the map
    longitude: number; // Longitude of state might be used when generating the map
    last_report_date: Date; // Date of when the last case was reported
}
export { IFlockCasesByState };
