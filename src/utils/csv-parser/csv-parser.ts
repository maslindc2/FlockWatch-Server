import { parse } from "csv-parse/sync";
import { logger } from "../winston-logger";

export class CSVParser {
    /**
     *
     * @param fileContent this is the raw data that was returned from readCSVFile as a string
     * @param delimiter This is the files delimiter most UTF-16LE files use "\t" but if you use UTF-8 you might have a ","
     * @param startFromRow Starts the CSV parsing from a specific line helpful for skipping header rows
     * @throws error if parseCSV cannot parse the raw data
     * @returns Parsed CSV data using the delimiter creates an array
     */
    public static parseCSV(
        fileContent: string | null,
        delimiter: string,
        startFromRow: number,
        columns: boolean | string[] = true
    ): any[] {
        if (!fileContent) return [];
        try {
            return parse(fileContent, {
                delimiter: delimiter,
                from_line: startFromRow,
                columns: columns,
                trim: true,
                skip_records_with_empty_values: true,
            });
        } catch (error) {
            logger.error(`Error parsing CSV file: ${error}`);
            return [];
        }
    }
}
