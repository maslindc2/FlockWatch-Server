import { IFlockCasesByState } from "../../../interfaces/i-flock-cases-by-state";
import { logger } from "../../winston-logger";
import { CSVParserStrategy } from "../csv-parser";

export class FlockCasesByStateStrategy
    implements CSVParserStrategy<IFlockCasesByState>
{
    transformData(parsedData: any[]): any[] {
        return parsedData.map((row, index) => {
            try {
                return {
                    stateAbbreviation: row["State Abbreviation"],
                    state: row["State Name"],
                    backyardFlocks:
                        Number(row["Backyard Flocks"].replace(/,/g, "")) || 0,
                    birdsAffected:
                        Number(row["Birds Affected"].replace(/,/g, "")) || 0,
                    commercialFlocks:
                        Number(row["Commercial Flocks"].replace(/,/g, "")) || 0,
                    totalFlocks:
                        Number(row["Total Flocks"].replace(/,/g, "")) || 0,
                    latitude: parseFloat(row["Latitude (generated)"]),
                    longitude: parseFloat(row["Longitude (generated)"]),
                    lastReportedDate: this.extractDate(
                        row["Last Reported Detection Text"]
                    ),
                };
            } catch (error) {
                logger.error(`Error transforming row at ${index}: ${error}`);
                return null;
            }
        });
    }
    /**
     * This takes in a string like "Last reported detection 1/30/2025." and converts it to 1/30/2025
     * then we restructure it to pass to JavaScript's Date datatype and create a JavaScript Date
     * @param dateAsString Takes in a string containing the date.
     * @returns Converts the date into a JavaScript Date Object
     */
    public extractDate(dateAsString: string): Date | null {
        const match = dateAsString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);

        if (!match) {
            logger.error(`Date ${dateAsString} did not match the Date REGEX!`);
            return null;
        }
        const [, month, day, year] = match.map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    }
}
