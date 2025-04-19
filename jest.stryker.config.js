/** @type {import('ts-jest').JestConfigWithTsJest} **/

// As Stryker does not support the multiple project setup that we have currently with jest
// we need to use a separate flat config file.
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testPathIgnorePatterns: ["src/utils/", ".stryker-temp/"],
    coverageDirectory: "testing-reports/unit-and-integration/",
    transform: {
        "^.+.tsx?$": ["ts-jest", {}],
    },
    setupFiles: [],
};