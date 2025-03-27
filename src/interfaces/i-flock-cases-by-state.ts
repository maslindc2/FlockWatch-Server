interface IFlockCasesByState {
    stateAbbreviation: string;
    state: string;
    backyardFlocks: number;
    commercialFlocks: number;
    birdsAffected: number;
    totalFlocks: number;
    latitude: number;
    longitude: number;
    lastReportedDate: Date;
}
export {IFlockCasesByState}