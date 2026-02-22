/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest/presets/default-esm",
    testEnvironment: "node",
    testMatch: ["<rootDir>/test/**/*.test.ts"],
    extensionsToTreatAsEsm: [".ts"],
    moduleNameMapper: {
        "^@/plugins/(.*)\\.js$": "<rootDir>/src/plugin-adapters/$1.ts",
        "^@/plugins/(.*)$": "<rootDir>/src/plugin-adapters/$1"
    },
    transform: {
        "^.+\\.ts$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.test.json" }]
    },
    moduleFileExtensions: ["ts", "js", "json"]
};
