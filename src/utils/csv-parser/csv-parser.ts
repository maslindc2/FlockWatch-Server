import fs from "fs";
import { parse } from "csv-parse/sync";
import { logger } from "../winston-logger";

export interface CSVParserStrategy<T> {
    transformData(rowData: any[]): T[];
}

export class CSVParser<T> {
    private strategy: CSVParserStrategy<T>;
    constructor(strategy: CSVParserStrategy<T>) {
        this.strategy = strategy;
    }
    /**
     * Use FS to read a file synchronously and output the raw data
     * @param filePath takes in the file path as type string uses the path library to resolve the path
     * @param fileEncoding only accepts BufferEncoding options for the file's encoding
     * @throws Throws error if the file is missing or does not exist
     * @returns raw data from the csv file, pass this to the parseCSV function
     */
    public readCSVFile(filePath: string, fileEncoding: BufferEncoding): string {
        try {
            return fs.readFileSync(filePath, { encoding: fileEncoding });
        } catch (error) {
            logger.error(`Error reading CSV File at ${filePath}`);
            logger.error(error);
            return "";
        }
    }

    /**
     *
     * @param fileContent this is the raw data that was returned from readCSVFile as a string
     * @param delimiter This is the files delimiter most UTF-16LE files use "\t" but if you use UTF-8 you might have a ","
     * @param startFromRow Starts the CSV parsing from a specific line helpful for skipping header rows
     * @throws error if parseCSV cannot parse the raw data
     * @returns Parsed CSV data using the delimiter creates an array
     */
    public parseCSV(
        fileContent: string | null,
        delimiter: string,
        startFromRow: number,
        columns: boolean | string[] = true
    ): any[] {
        if (!fileContent) return [];
        try {
            const parsedData = parse(fileContent, {
                delimiter: delimiter,
                from_line: startFromRow,
                columns: columns,
                trim: true,
                skip_records_with_empty_values: true,
            });
            return this.strategy.transformData(parsedData);
        } catch (error) {
            logger.error(`Error parsing CSV file: ${error}`);
            return [];
        }
    }
}
