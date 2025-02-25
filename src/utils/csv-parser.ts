import * as fs from "fs";
import * as path from "path";
import {parse} from "csv-parse/sync";
import { logger } from "./winston-logger";

/**
 * This class is for parsing any CSV Files that we need for Flock Watch to work.
 * Currently we only need one file called "Map Comparisons.csv"
 * When processing additional files you need to write a new transformDataTo___ function.
 * This function is transforms the CSV data into the fields needed for the data model you are making.
 * 
 * All other functions can be reutilized.
 */

export class CSVParser {
    /**
     * Use FS to read a file synchronously and output the raw data
     * @param filePath takes in the file path as type string uses the path library to resolve the path
     * @param fileEncoding only accepts BufferEncoding options for the file's encoding
     * @throws Throws error if the file is missing or does not exist
     * @returns raw data from the csv file, pass this to the parseCSV function
     */
    private static readCSVFile(filePath: string, fileEncoding: BufferEncoding): string | null {
        try {
            return fs.readFileSync(filePath, {encoding: fileEncoding});    
        } catch (error) {
            logger.error(`Error reading CSV File at ${filePath}`)
            logger.error(error)
            return null
        }
    }

    /**
     * 
     * @param fileContent this is the raw data that was returned from readCSVFile as a string
     * @param delimiter This is the files delimiter most UTF-16LE files use "\t" but if you use UTF-8 you might have a ","
     * @throws error if parseCSV cannot parse the raw data
     * @returns Parsed CSV data using the delimiter creates an array
     */
    private static parseCSV(fileContent: string | null, delimiter: string): any[] {
        if (!fileContent)
            return [];
        try {
            return parse(fileContent, {
                delimiter: delimiter,
                columns: true,
                trim: true
            });
        } catch (error) {
            logger.error(`Error parsing CSV file: ${error}`);
            return [];
        }
    }
    /**
     * Transforms the parsed "Map Comparisons.csv" data into the Flock Cases By State structure for the database
     * This will go through and only use the required rows/headers and transforms the string into the correct datatype
     * @param parsedData This is the data that was returned from the parseCSV function, always an array.
     * @throws Throws an error if the header is missing or is incorrect. If USDA ever changes a headers name and it's not set correctly here...you win an error
     * @returns The structured data as an array ready to be used to store or update the FlockCasesByStateModel
     */
    private static transformDataToFlockCasesByStateModel(parsedData: any[]): any[] {
        return parsedData.map((row, index) => {
            try {
                return {
                    state: row["State Name"],
                    backyardFlocks: Number(row["Backyard Flocks"].replace(/,/g, "")) || 0,
                    birdsAffected: Number(row["Birds Affected"].replace(/,/g, "")) || 0,
                    commercialFlocks: Number(row["Commercial Flocks"].replace(/,/g, "")) || 0,
                    totalFlocks: Number(row["Total Flocks"].replace(/,/g, "")) || 0,
                    latitude: parseFloat(row["Latitude (generated)"]),
                    longitude: parseFloat(row["Longitude (generated)"]),
                    lastReportedDate: CSVParser.extractDate(row["Last Reported Detection Text"]),
                }
            } catch (error) {
                logger.error(`Error transforming row at ${index}: ${error}`);
                return null;
            }
            
        });
    };
    
    /**
     * This takes in a string like "Last reported detection 1/30/2025." and converts it to 1/30/2025
     * then we restructure it to pass to JavaScript's Date datatype and create a JavaScript Date
     * @param dateAsString Takes in a string containing the date.
     * @returns Converts the date into a JavaScript Date Object
     */
    private static extractDate(dateAsString: string): Date | null {
        const match = dateAsString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if(!match){
            logger.error(`Date ${match} did not match the Date REGEX!`)
            return null;
        }
        const [, month, day, year] = match.map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    }
    
    /**
     * This function is used to gather all the data needed for the FlockCasesByState Model and extracts it into a JSON array
     * @param relativePath Takes in a relative path to the Map Comparisons.csv file IMPORTANT: Relative means Relative to "csv-parser.ts"
     * @returns an array containing the Flock Cases By State Data.
     */
    public static async gatherFlockCasesByState(relativePath): Promise<any[]> {
        const csvFilePath = path.resolve(__dirname, "../../data/Map Comparisons.csv");
        logger.silly(`Parsing CSV File at ${csvFilePath}`);
        const csvData = CSVParser.readCSVFile(csvFilePath, "utf-16le");
        const parsedData = CSVParser.parseCSV(csvData, "\t");
        const transformedData = CSVParser.transformDataToFlockCasesByStateModel(parsedData);
        return transformedData;
    }
}