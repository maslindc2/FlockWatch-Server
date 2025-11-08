# Flock Watch
Monitoring platform designed to track avian influenza across the U.S. It provides an easy-to-use dashboard where users can view up-to-date statistics on affected flocks, birds, and states covering both backyard and commercial operations all in one place.
<p align="center">
	<img src="https://skillicons.dev/icons?i=nodejs,ts,jest,express,mongodb" />
</p>

# About This Repository
This is the backend repository for Flock Watch. Built witch Node.js, Express, TypeScript, Mongoose ODM, and MongoDB. 
The server is responsible for:
- Serving avian influenza case data
- Exposing a clean REST API
- Processing data received from the Flock Watch Scraper.
- Managing database interactions.

# Getting Started
### Prerequisites
- Node.js (>= 22 lts recommended)
- npm 
- MongoDB Running locally or via Docker

### Installation
```
# Clone the repository
git clone  https://github.com/maslindc2/FlockWatch-React.git

# Navigate to the directory
cd FlockWatch-Server

# Install dependencies
npm install
```

### Scripts
```
# Start the development server
npm run dev
# Build the TypeScript project
npm run build
# Run Test Suite
npm run test
# Run Only Unit Tests
npm run test:unit
# Generate Coverage Reports
npm run test:coverage
# Lint
npm run lint
# Run Prettier
npm run format
```

### Environment Variables
```
MONGODB_URI=mongodb://user:password@localhost:27017/flockwatch
SCRAPING_SERVICE_URL= Custom url to FlockWatch-Scraping or the default value of http://localhost:8080/scraper/process-data
PORT=server's port number default is 5050
```
### API Routes
| Endpoint                                | Method | Description                              |
| --------------------------------------- | ------ | ---------------------------------------- |
| `/data/flocks-cases`                    | GET    | Get flock cases for all states           |
| `/data/us-summary/`                     | GET    | Get US All Time and Period Summaries     |
| `/data/flock-cases/:state-abbreviation` | GET    | Get a single state's flock cases i.e. WA |
