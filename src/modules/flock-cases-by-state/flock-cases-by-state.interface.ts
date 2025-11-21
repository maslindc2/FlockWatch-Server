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
export { FlockCasesByState };
