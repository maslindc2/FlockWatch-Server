# Changelog

All notable changes to this project will be documented in this file. See [commit-and-tag-version](https://github.com/absolute-version/commit-and-tag-version) for commit guidelines.

## 0.7.0 (2026-06-21)


### ⚠ BREAKING CHANGES

* API Rename and project structure refactor

* Merge pull request #23 from maslindc2/API-Rename ([2b88aa3](https://github.com/maslindc2/FlockWatch-Scraping/commit/2b88aa342ab9c11594283234d04a97d3ea4f772f)), closes [#23](https://github.com/maslindc2/FlockWatch-Scraping/issues/23)


### Features

* Add endpoint and service for retrieving aggregated site summaries by production type ([63df395](https://github.com/maslindc2/FlockWatch-Scraping/commit/63df395a80aa807695af6de8aa57209bacd36f48))
* Add endpoints for retrieving site details by production type and distinct production types with pagination ([02affc3](https://github.com/maslindc2/FlockWatch-Scraping/commit/02affc32ece12d09c8d82c4c95d81dc47c389405))
* Add outbreak timeline service and endpoint for retrieving site timeline data ([cf7a71e](https://github.com/maslindc2/FlockWatch-Scraping/commit/cf7a71eb26ea98f487aa201db56bb81b44c95f67))
* Add state validation and update sanitized entry handling in flock data processing ([da51b9b](https://github.com/maslindc2/FlockWatch-Scraping/commit/da51b9b4effd80f0d1a6d8bf98995d6eb0a80cf9))
* add StatusSummary model and service for managing status summaries ([26fd282](https://github.com/maslindc2/FlockWatch-Scraping/commit/26fd282a28c4a5b4c535409fb691bae02bf64faa))
* added indices supporting most common queries for the new routes ([ed06529](https://github.com/maslindc2/FlockWatch-Scraping/commit/ed06529c3d87ebca26f470b0dc68481c88d601fe))
* Enhance state data handling with validation and sanitization ([b49df45](https://github.com/maslindc2/FlockWatch-Scraping/commit/b49df457e38cfdea602453e1b06ccc88ba8a15f6))
* Implement validation for flock data entries and update state abbreviation handling ([b7eb05d](https://github.com/maslindc2/FlockWatch-Scraping/commit/b7eb05d4d33b91fc7a9137c6d1cf37dcbe945eda))
* restructure flock data sync service and implement scraping functionality ([42b1a80](https://github.com/maslindc2/FlockWatch-Scraping/commit/42b1a805be8ec7bb7e2eae68c3417a4d1da6c250))
* Update dependencies and refactor data sync services ([8006055](https://github.com/maslindc2/FlockWatch-Scraping/commit/8006055382e25a8e2a43055776a206cd2eb40203))


### Bug Fixes

* Added input validation using Zog, improved authID validation, and removed old Docker files. ([53bcc7a](https://github.com/maslindc2/FlockWatch-Scraping/commit/53bcc7af5c1261b00b720536d040dac2ea7ffa03))
* Added input validation using Zog, improved authID validation, and removed old Docker files. ([720b9c6](https://github.com/maslindc2/FlockWatch-Scraping/commit/720b9c627d0985bae81357735dd5d01fa9420428))
* attempting to fix version bump action once more ([892a110](https://github.com/maslindc2/FlockWatch-Scraping/commit/892a110dc888892e5374342f99adf833b8e0930c))
* Enhance authID validation and update test cases for improved data handling ([d08c58d](https://github.com/maslindc2/FlockWatch-Scraping/commit/d08c58dbfcf5c9a654e1865379f5f1216f93bf5b))
* Refactor error messages and add null checks in DataController methods ([9a3c2df](https://github.com/maslindc2/FlockWatch-Scraping/commit/9a3c2df7eb5d5623410c55f9bddc5a48bee32743))
* replacing current prettier with original prettier action ([e037eeb](https://github.com/maslindc2/FlockWatch-Scraping/commit/e037eeb19700f6edbe417e8f345c012ad3105dd4))
* Set MONGODB_URI environment variable during MongoDB connection setup, avoids DB wipes when running integration tests ([502c5ea](https://github.com/maslindc2/FlockWatch-Scraping/commit/502c5ea075070f92a9bc7a4301bfe31a106bb502))
* Switched from --testPathPattern to --testPathPatterns ([34099f6](https://github.com/maslindc2/FlockWatch-Scraping/commit/34099f6ea3044e2d57020bfa6238e31ed28e754e))
* Update pipeline type to PipelineStage for better type safety in getProductionTypeSummary method ([6e29c4c](https://github.com/maslindc2/FlockWatch-Scraping/commit/6e29c4c8a48cc1ca2cab1723685cd279537d2cbe))

## 0.6.0 (2026-06-13)


### ⚠ BREAKING CHANGES

* API Rename and project structure refactor

* Merge pull request #23 from maslindc2/API-Rename ([2b88aa3](https://github.com/maslindc2/FlockWatch-Scraping/commit/2b88aa342ab9c11594283234d04a97d3ea4f772f)), closes [#23](https://github.com/maslindc2/FlockWatch-Scraping/issues/23)


### Features

* Add endpoint and service for retrieving aggregated site summaries by production type ([63df395](https://github.com/maslindc2/FlockWatch-Scraping/commit/63df395a80aa807695af6de8aa57209bacd36f48))
* Add endpoints for retrieving site details by production type and distinct production types with pagination ([02affc3](https://github.com/maslindc2/FlockWatch-Scraping/commit/02affc32ece12d09c8d82c4c95d81dc47c389405))
* Add outbreak timeline service and endpoint for retrieving site timeline data ([cf7a71e](https://github.com/maslindc2/FlockWatch-Scraping/commit/cf7a71eb26ea98f487aa201db56bb81b44c95f67))
* Add state validation and update sanitized entry handling in flock data processing ([da51b9b](https://github.com/maslindc2/FlockWatch-Scraping/commit/da51b9b4effd80f0d1a6d8bf98995d6eb0a80cf9))
* add StatusSummary model and service for managing status summaries ([26fd282](https://github.com/maslindc2/FlockWatch-Scraping/commit/26fd282a28c4a5b4c535409fb691bae02bf64faa))
* added indices supporting most common queries for the new routes ([ed06529](https://github.com/maslindc2/FlockWatch-Scraping/commit/ed06529c3d87ebca26f470b0dc68481c88d601fe))
* Enhance state data handling with validation and sanitization ([b49df45](https://github.com/maslindc2/FlockWatch-Scraping/commit/b49df457e38cfdea602453e1b06ccc88ba8a15f6))
* Implement validation for flock data entries and update state abbreviation handling ([b7eb05d](https://github.com/maslindc2/FlockWatch-Scraping/commit/b7eb05d4d33b91fc7a9137c6d1cf37dcbe945eda))
* restructure flock data sync service and implement scraping functionality ([42b1a80](https://github.com/maslindc2/FlockWatch-Scraping/commit/42b1a805be8ec7bb7e2eae68c3417a4d1da6c250))
* Update dependencies and refactor data sync services ([8006055](https://github.com/maslindc2/FlockWatch-Scraping/commit/8006055382e25a8e2a43055776a206cd2eb40203))


### Bug Fixes

* Added input validation using Zog, improved authID validation, and removed old Docker files. ([53bcc7a](https://github.com/maslindc2/FlockWatch-Scraping/commit/53bcc7af5c1261b00b720536d040dac2ea7ffa03))
* Added input validation using Zog, improved authID validation, and removed old Docker files. ([720b9c6](https://github.com/maslindc2/FlockWatch-Scraping/commit/720b9c627d0985bae81357735dd5d01fa9420428))
* attempting to fix version bump action once more ([892a110](https://github.com/maslindc2/FlockWatch-Scraping/commit/892a110dc888892e5374342f99adf833b8e0930c))
* Enhance authID validation and update test cases for improved data handling ([d08c58d](https://github.com/maslindc2/FlockWatch-Scraping/commit/d08c58dbfcf5c9a654e1865379f5f1216f93bf5b))
* Refactor error messages and add null checks in DataController methods ([9a3c2df](https://github.com/maslindc2/FlockWatch-Scraping/commit/9a3c2df7eb5d5623410c55f9bddc5a48bee32743))
* replacing current prettier with original prettier action ([e037eeb](https://github.com/maslindc2/FlockWatch-Scraping/commit/e037eeb19700f6edbe417e8f345c012ad3105dd4))
* Set MONGODB_URI environment variable during MongoDB connection setup, avoids DB wipes when running integration tests ([502c5ea](https://github.com/maslindc2/FlockWatch-Scraping/commit/502c5ea075070f92a9bc7a4301bfe31a106bb502))
* Switched from --testPathPattern to --testPathPatterns ([34099f6](https://github.com/maslindc2/FlockWatch-Scraping/commit/34099f6ea3044e2d57020bfa6238e31ed28e754e))
* Update pipeline type to PipelineStage for better type safety in getProductionTypeSummary method ([6e29c4c](https://github.com/maslindc2/FlockWatch-Scraping/commit/6e29c4c8a48cc1ca2cab1723685cd279537d2cbe))

## 0.5.0 (2026-06-05)


### ⚠ BREAKING CHANGES

* API Rename and project structure refactor

* Merge pull request #23 from maslindc2/API-Rename ([2b88aa3](https://github.com/maslindc2/FlockWatch-Scraping/commit/2b88aa342ab9c11594283234d04a97d3ea4f772f)), closes [#23](https://github.com/maslindc2/FlockWatch-Scraping/issues/23)


### Features

* Add endpoint and service for retrieving aggregated site summaries by production type ([63df395](https://github.com/maslindc2/FlockWatch-Scraping/commit/63df395a80aa807695af6de8aa57209bacd36f48))
* Add endpoints for retrieving site details by production type and distinct production types with pagination ([02affc3](https://github.com/maslindc2/FlockWatch-Scraping/commit/02affc32ece12d09c8d82c4c95d81dc47c389405))
* Add outbreak timeline service and endpoint for retrieving site timeline data ([cf7a71e](https://github.com/maslindc2/FlockWatch-Scraping/commit/cf7a71eb26ea98f487aa201db56bb81b44c95f67))
* Add state validation and update sanitized entry handling in flock data processing ([da51b9b](https://github.com/maslindc2/FlockWatch-Scraping/commit/da51b9b4effd80f0d1a6d8bf98995d6eb0a80cf9))
* add StatusSummary model and service for managing status summaries ([26fd282](https://github.com/maslindc2/FlockWatch-Scraping/commit/26fd282a28c4a5b4c535409fb691bae02bf64faa))
* added indices supporting most common queries for the new routes ([ed06529](https://github.com/maslindc2/FlockWatch-Scraping/commit/ed06529c3d87ebca26f470b0dc68481c88d601fe))
* Enhance state data handling with validation and sanitization ([b49df45](https://github.com/maslindc2/FlockWatch-Scraping/commit/b49df457e38cfdea602453e1b06ccc88ba8a15f6))
* Implement validation for flock data entries and update state abbreviation handling ([b7eb05d](https://github.com/maslindc2/FlockWatch-Scraping/commit/b7eb05d4d33b91fc7a9137c6d1cf37dcbe945eda))
* restructure flock data sync service and implement scraping functionality ([42b1a80](https://github.com/maslindc2/FlockWatch-Scraping/commit/42b1a805be8ec7bb7e2eae68c3417a4d1da6c250))
* Update dependencies and refactor data sync services ([8006055](https://github.com/maslindc2/FlockWatch-Scraping/commit/8006055382e25a8e2a43055776a206cd2eb40203))


### Bug Fixes

* Added input validation using Zog, improved authID validation, and removed old Docker files. ([53bcc7a](https://github.com/maslindc2/FlockWatch-Scraping/commit/53bcc7af5c1261b00b720536d040dac2ea7ffa03))
* Added input validation using Zog, improved authID validation, and removed old Docker files. ([720b9c6](https://github.com/maslindc2/FlockWatch-Scraping/commit/720b9c627d0985bae81357735dd5d01fa9420428))
* attempting to fix version bump action once more ([892a110](https://github.com/maslindc2/FlockWatch-Scraping/commit/892a110dc888892e5374342f99adf833b8e0930c))
* Enhance authID validation and update test cases for improved data handling ([d08c58d](https://github.com/maslindc2/FlockWatch-Scraping/commit/d08c58dbfcf5c9a654e1865379f5f1216f93bf5b))
* Refactor error messages and add null checks in DataController methods ([9a3c2df](https://github.com/maslindc2/FlockWatch-Scraping/commit/9a3c2df7eb5d5623410c55f9bddc5a48bee32743))
* replacing current prettier with original prettier action ([e037eeb](https://github.com/maslindc2/FlockWatch-Scraping/commit/e037eeb19700f6edbe417e8f345c012ad3105dd4))
* Set MONGODB_URI environment variable during MongoDB connection setup, avoids DB wipes when running integration tests ([502c5ea](https://github.com/maslindc2/FlockWatch-Scraping/commit/502c5ea075070f92a9bc7a4301bfe31a106bb502))
* Switched from --testPathPattern to --testPathPatterns ([34099f6](https://github.com/maslindc2/FlockWatch-Scraping/commit/34099f6ea3044e2d57020bfa6238e31ed28e754e))
* Update pipeline type to PipelineStage for better type safety in getProductionTypeSummary method ([6e29c4c](https://github.com/maslindc2/FlockWatch-Scraping/commit/6e29c4c8a48cc1ca2cab1723685cd279537d2cbe))

## 0.4.0 (2026-06-03)


### ⚠ BREAKING CHANGES

* API Rename and project structure refactor

* Merge pull request #23 from maslindc2/API-Rename ([2b88aa3](https://github.com/maslindc2/FlockWatch-Scraping/commit/2b88aa342ab9c11594283234d04a97d3ea4f772f)), closes [#23](https://github.com/maslindc2/FlockWatch-Scraping/issues/23)


### Features

* Add state validation and update sanitized entry handling in flock data processing ([da51b9b](https://github.com/maslindc2/FlockWatch-Scraping/commit/da51b9b4effd80f0d1a6d8bf98995d6eb0a80cf9))
* add StatusSummary model and service for managing status summaries ([26fd282](https://github.com/maslindc2/FlockWatch-Scraping/commit/26fd282a28c4a5b4c535409fb691bae02bf64faa))
* Enhance state data handling with validation and sanitization ([b49df45](https://github.com/maslindc2/FlockWatch-Scraping/commit/b49df457e38cfdea602453e1b06ccc88ba8a15f6))
* Implement validation for flock data entries and update state abbreviation handling ([b7eb05d](https://github.com/maslindc2/FlockWatch-Scraping/commit/b7eb05d4d33b91fc7a9137c6d1cf37dcbe945eda))
* restructure flock data sync service and implement scraping functionality ([42b1a80](https://github.com/maslindc2/FlockWatch-Scraping/commit/42b1a805be8ec7bb7e2eae68c3417a4d1da6c250))
* Update dependencies and refactor data sync services ([8006055](https://github.com/maslindc2/FlockWatch-Scraping/commit/8006055382e25a8e2a43055776a206cd2eb40203))


### Bug Fixes

* Added input validation using Zog, improved authID validation, and removed old Docker files. ([53bcc7a](https://github.com/maslindc2/FlockWatch-Scraping/commit/53bcc7af5c1261b00b720536d040dac2ea7ffa03))
* Added input validation using Zog, improved authID validation, and removed old Docker files. ([720b9c6](https://github.com/maslindc2/FlockWatch-Scraping/commit/720b9c627d0985bae81357735dd5d01fa9420428))
* attempting to fix version bump action once more ([892a110](https://github.com/maslindc2/FlockWatch-Scraping/commit/892a110dc888892e5374342f99adf833b8e0930c))
* Enhance authID validation and update test cases for improved data handling ([d08c58d](https://github.com/maslindc2/FlockWatch-Scraping/commit/d08c58dbfcf5c9a654e1865379f5f1216f93bf5b))
* Refactor error messages and add null checks in DataController methods ([9a3c2df](https://github.com/maslindc2/FlockWatch-Scraping/commit/9a3c2df7eb5d5623410c55f9bddc5a48bee32743))
* replacing current prettier with original prettier action ([e037eeb](https://github.com/maslindc2/FlockWatch-Scraping/commit/e037eeb19700f6edbe417e8f345c012ad3105dd4))
* Switched from --testPathPattern to --testPathPatterns ([34099f6](https://github.com/maslindc2/FlockWatch-Scraping/commit/34099f6ea3044e2d57020bfa6238e31ed28e754e))

## 0.3.0 (2026-05-23)


### ⚠ BREAKING CHANGES

* API Rename and project structure refactor

* Merge pull request #23 from maslindc2/API-Rename ([2b88aa3](https://github.com/maslindc2/FlockWatch-Scraping/commit/2b88aa342ab9c11594283234d04a97d3ea4f772f)), closes [#23](https://github.com/maslindc2/FlockWatch-Scraping/issues/23)


### Features

* Add state validation and update sanitized entry handling in flock data processing ([da51b9b](https://github.com/maslindc2/FlockWatch-Scraping/commit/da51b9b4effd80f0d1a6d8bf98995d6eb0a80cf9))
* add StatusSummary model and service for managing status summaries ([26fd282](https://github.com/maslindc2/FlockWatch-Scraping/commit/26fd282a28c4a5b4c535409fb691bae02bf64faa))
* Enhance state data handling with validation and sanitization ([b49df45](https://github.com/maslindc2/FlockWatch-Scraping/commit/b49df457e38cfdea602453e1b06ccc88ba8a15f6))
* Implement validation for flock data entries and update state abbreviation handling ([b7eb05d](https://github.com/maslindc2/FlockWatch-Scraping/commit/b7eb05d4d33b91fc7a9137c6d1cf37dcbe945eda))
* restructure flock data sync service and implement scraping functionality ([42b1a80](https://github.com/maslindc2/FlockWatch-Scraping/commit/42b1a805be8ec7bb7e2eae68c3417a4d1da6c250))
* Update dependencies and refactor data sync services ([8006055](https://github.com/maslindc2/FlockWatch-Scraping/commit/8006055382e25a8e2a43055776a206cd2eb40203))


### Bug Fixes

* attempting to fix version bump action once more ([892a110](https://github.com/maslindc2/FlockWatch-Scraping/commit/892a110dc888892e5374342f99adf833b8e0930c))
* replacing current prettier with original prettier action ([e037eeb](https://github.com/maslindc2/FlockWatch-Scraping/commit/e037eeb19700f6edbe417e8f345c012ad3105dd4))
* Switched from --testPathPattern to --testPathPatterns ([34099f6](https://github.com/maslindc2/FlockWatch-Scraping/commit/34099f6ea3044e2d57020bfa6238e31ed28e754e))

## 0.2.0 (2026-05-16)


### ⚠ BREAKING CHANGES

* API Rename and project structure refactor

* Merge pull request #23 from maslindc2/API-Rename ([2b88aa3](https://github.com/maslindc2/FlockWatch-Scraping/commit/2b88aa342ab9c11594283234d04a97d3ea4f772f)), closes [#23](https://github.com/maslindc2/FlockWatch-Scraping/issues/23)


### Features

* Add state validation and update sanitized entry handling in flock data processing ([da51b9b](https://github.com/maslindc2/FlockWatch-Scraping/commit/da51b9b4effd80f0d1a6d8bf98995d6eb0a80cf9))
* add StatusSummary model and service for managing status summaries ([26fd282](https://github.com/maslindc2/FlockWatch-Scraping/commit/26fd282a28c4a5b4c535409fb691bae02bf64faa))
* Enhance state data handling with validation and sanitization ([b49df45](https://github.com/maslindc2/FlockWatch-Scraping/commit/b49df457e38cfdea602453e1b06ccc88ba8a15f6))
* Implement validation for flock data entries and update state abbreviation handling ([b7eb05d](https://github.com/maslindc2/FlockWatch-Scraping/commit/b7eb05d4d33b91fc7a9137c6d1cf37dcbe945eda))
* restructure flock data sync service and implement scraping functionality ([42b1a80](https://github.com/maslindc2/FlockWatch-Scraping/commit/42b1a805be8ec7bb7e2eae68c3417a4d1da6c250))
* Update dependencies and refactor data sync services ([8006055](https://github.com/maslindc2/FlockWatch-Scraping/commit/8006055382e25a8e2a43055776a206cd2eb40203))


### Bug Fixes

* attempting to fix version bump action once more ([892a110](https://github.com/maslindc2/FlockWatch-Scraping/commit/892a110dc888892e5374342f99adf833b8e0930c))
* replacing current prettier with original prettier action ([e037eeb](https://github.com/maslindc2/FlockWatch-Scraping/commit/e037eeb19700f6edbe417e8f345c012ad3105dd4))
* Switched from --testPathPattern to --testPathPatterns ([34099f6](https://github.com/maslindc2/FlockWatch-Scraping/commit/34099f6ea3044e2d57020bfa6238e31ed28e754e))
