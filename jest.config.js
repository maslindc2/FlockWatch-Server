/** @type {import('ts-jest').JestConfigWithTsJest} **/
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
