/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    testPathIgnorePatterns: [
        "src/utils/"
    ],
    transform: {
        "^.+.tsx?$": ["ts-jest", {}],
    },
    setupFiles: []
};
