// Data type for each state and the required attributes
// This interface is for flock cases for each individual state
// CSV to use is "Map Comparisons.csv"
interface IFlockCasesByState {
    stateAbbreviation: string;  // State abbreviation used on the Frontend for each state
    state: string;              // Full state name
    backyardFlocks: number;     // Number of backyard flocks that have been infected
    commercialFlocks: number;   // Number of commercial flocks that have been infected
    birdsAffected: number;      // Total number of birds infected
    totalFlocks: number;        // Total number of flocks infected
    latitude: number;           // Latitude of state might be used when generating the map
    longitude: number;          // Longitude of state might be used when generating the map
    lastReportedDate: Date;     // Date of when the last case was reported
}
export {IFlockCasesByState}