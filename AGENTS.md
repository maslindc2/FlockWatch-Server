# FlockWatch-Server — Agent Guide

## Project

Backend for the Flock Watch avian influenza monitoring platform.  
Node.js / TypeScript / Express / Mongoose / MongoDB.  
CommonJS modules (`"type": "commonjs"` in package.json).

## Key Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Builds TypeScript and starts the server from `dist/server.js` |
| `npm run build` | Compiles TypeScript (`tsc`) |
| `npm test` | Runs all Jest tests with coverage |
| `npm run test:unit` | Unit tests only |
| `npm run test:integration` | Integration tests only |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier formatting |
| `npm run docs` | Generate TypeDoc documentation into `docs/` |

## Code Conventions

- **Imports:** Named exports using `export { Name }`. No default exports (except `router` in routes).
- **Classes:** Services and models are classes. Models use static schemas and `getModel` static property.
- **JSDoc:** All interfaces, classes, and public methods must have `/** ... */` comments with `@param`/`@returns`.
- **Doc generation:** TypeDoc with `entryPointStrategy: "expand"`, includes private/protected members.
- **Type definitions:** Plain interfaces in `.interface.ts`, Mongoose document interfaces in `-document.interface.ts`.
- **Models:** Mongoose models follow the pattern: private `static schema`, public `static getModel`.
- **Testing:** Jest with `ts-jest`. Unit tests co-located in `tests/unit/`, integration in `tests/integration/`.

## Entry Points

| File | Purpose |
|---|---|
| `src/server.ts` | Starts HTTP server, listens on `PORT` |
| `src/app.ts` | Express app setup (middleware, CORS, routes, lifecycle) |

## Module Structure

```
src/
  app.ts                — Express app configuration
  server.ts             — HTTP server entry point
  config/
    rolling-periods.ts  — Rolling period constants
  controllers/
    data.controller.ts  — Express route handlers
  routes/
    server.routes.ts    — Express router definitions
  utils/
    winston-logger.ts   — Winston logger setup
  validation/
    flock-data.schema.ts — Zod schemas for data validation
  modules/
    database/             — MongoDB connection
    data-updating/        — Sync, request, apply data from scraping service
    fetch-retry/          — HTTP fetch with retry + auth
    flock-cases-by-state/ — Per-state case data
    historical-summary/   — All-time summary
    last-report-date/     — Scrape timestamp + auth_id
    site-details/         — Premises-level details
    status-summary/       — 30-day rolling status
    us-summary/           — Nationwide all-time + period summaries
```

## Environment Variables

```
MONGODB_URI            — MongoDB connection string (required)
PORT                   — Server port (default 5050)
SCRAPING_SERVICE_URL   — URL of the scraping service
AUTO_UPDATE            — "true" = server auto-syncs; "false" = scraper pushes via POST
LOG_LEVEL              — Winston log level (default "error")
FRONTEND_DOMAIN        — Allowed CORS origin (production)
NODE_ENV               — "development" allows all CORS origins
```
