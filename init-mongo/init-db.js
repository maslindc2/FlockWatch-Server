//@ts-nocheck
// Require fs for reading from JSON files that we'll use to populate the DB
const fs = require("fs");

// Read each of the JSON files containing data from mongo
const lastReportDateAsJSON = fs.readFileSync("init-mongo/last-report-dates-data.json");
const usSummariesAsJSON = fs.readFileSync("init-mongo/us-summaries-data.json");

//Parse all the JSON files containing the data we are going to insert
const lastReportDateObj = JSON.parse(lastReportDateAsJSON);
const usSummariesObj = JSON.parse(usSummariesAsJSON);

// Connect to the local mongodb instance using the admin login
db = connect(`mongodb://admin:flockwatch@localhost:27017/`);

// Get the sibling db (this will create the db if it doesn't exist already)
db = db.getSiblingDB("flockwatch");

// Get (or create if it does not exist) the collections we need
const lastReportDateCollection = db.getCollection("last-report-date");
const usSummariesCollection = db.getCollection("us-summaries");

/**
 * Clear out each collection.
 * Why do this? Remove stale data, this script will only be used for dev/testing purposes
 * so we populate the Local MongoDB using only fresh data. In the event there is a specific test set of data
 * that needs to be used this will ensure the DB only includes that test set.
 */
lastReportDateCollection.deleteMany({});
usSummariesCollection.deleteMany({});

// Use insert many to insert all of the information
lastReportDateCollection.insertMany(lastReportDateObj);
usSummariesCollection.insertMany(usSummariesObj);
