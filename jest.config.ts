import type { Config } from 'jest';

const config: Config = {
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
        '^.+\\.tsx?$': [
            '@swc/jest',
            {
                sourceMaps: 'inline',
                module: {
                    type: 'es6',
                },
                jsc: {
                    target: 'es2022',
                    parser: {
                        syntax: 'typescript',
                        tsx: false,
                    },
                },
            },
        ],
    },
    collectCoverageFrom: ['src/**/*.ts'],
};

export default config;
