// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
    _comment:
        "This config was generated using 'stryker init'. Please take a look at: https://stryker-mutator.io/docs/stryker-js/configuration/ for more information.",
    packageManager: "npm",
    reporters: ["html", "clear-text", "progress"],
    htmlReporter: {
        fileName: "mutation/mutation.html"
    },
    
    testRunner: "jest",
    jest: {
        projectType: "custom",
        configFile: "jest.stryker.config.js",
    },
    testRunner_comment:
        "Take a look at https://stryker-mutator.io/docs/stryker-js/jest-runner for information about the jest plugin.",
    coverageAnalysis: "perTest",
    mutate: ["src/**/*.ts", "!src/utils/winston-logger.ts"]
};
export default config;
