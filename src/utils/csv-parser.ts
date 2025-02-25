import * as fs from "fs";
import * as path from "path";
import {parse} from "csv-parse/sync";
import { logger } from "./winston-logger";


export class CSVParser {
    private static readCSVFile(filePath: string): string | null {
        try {
            return fs.readFileSync(filePath, {encoding: "utf-16le"});    
        } catch (error) {
            logger.error(`Error reading CSV File at ${filePath}`)
            logger.error(error)
            return null
        }
    }

    private static parseCSV(fileContent: string | null): any[] {
        if (!fileContent)
            return [];
        try {
            return parse(fileContent, {
                delimiter: "\t",
                columns: true,
                trim: true
            });
        } catch (error) {
            logger.error(`Error parsing CSV file: ${error}`);
            return [];
        }
    }
    private static transformData(rawData: any[]): any[] {
        return rawData.map((row, index) => {
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
    
    private static extractDate(text: string): Date | null {
        const match = text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if(!match){
            logger.error(`Date ${match} did not match the Date REGEX!`)
            return null;
        }
        const [, month, day, year] = match.map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    }
    
    
    public static async gatherData(): Promise<any[]> {
        const csvFilePath = path.resolve(__dirname, "../../data/Map Comparisons.csv");
        logger.silly(`Parsing CSV File at ${csvFilePath}`);
        const csvData = CSVParser.readCSVFile(csvFilePath);
        const parsedData = CSVParser.parseCSV(csvData);
        const transformedData = CSVParser.transformData(parsedData);

        return transformedData;
    }
}