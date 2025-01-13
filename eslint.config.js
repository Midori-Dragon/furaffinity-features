import { FlatCompat } from '@eslint/eslintrc';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';
import { fileURLToPath } from 'url';
import path from 'path';

// Replace __dirname with a compatible ES module approach
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use FlatCompat to migrate from eslintrc-style configs
const compat = new FlatCompat({
    baseDirectory: __dirname,
});

export default [
    {
        files: ['**/*.ts'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2021,
            sourceType: 'module',
            globals: {
                window: 'readonly',
                document: 'readonly',
                GM: 'readonly',
                GM_getValue: 'readonly',
                GM_setValue: 'readonly',
            },
            parserOptions: {
                project: './tsconfig.json', // Adjust the path if your `tsconfig.json` is in a different location
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
            'import': importPlugin,
        },
        rules: {
            ...tsPlugin.configs.recommended.rules,
            'no-console': 'off',
            'no-alert': 'warn',
            'semi': ['warn', 'always'],
            'quotes': ['warn', 'single'],
            'eol-last': ['warn', 'always'],
            "indent": ['warn', 4],
            'linebreak-style': ['warn', 'unix'],
            'eqeqeq': ['warn', 'smart'],
            '@typescript-eslint/no-unused-vars': ['warn'],
            '@typescript-eslint/explicit-function-return-type': ['warn'],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-empty-function': ['warn'],
            '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
            '@typescript-eslint/strict-boolean-expressions': ['warn'],
            '@typescript-eslint/naming-convention': [
                'warn',
                {
                    selector: 'variable',
                    format: ['camelCase'],
                },
                {
                    selector: 'function',
                    format: ['camelCase'],
                },
                {
                    selector: 'typeLike',
                    format: ['PascalCase'],
                },
            ],
            'import/order': [
                'warn',
                {
                    groups: [
                        ['builtin', 'external'],
                        'internal',
                        ['parent', 'sibling', 'index'],
                    ],
                    'newlines-between': 'always',
                },
            ],
            'no-restricted-imports': [
                'warn',
                {
                    paths: ['lodash'],
                    patterns: ['@/internal/*'],
                },
            ],
            '@typescript-eslint/no-floating-promises': ['error'],
            '@typescript-eslint/no-misused-promises': ['warn'],
            'no-shadow': ['warn'],
            '@typescript-eslint/prefer-optional-chain': ['warn'],
            '@typescript-eslint/prefer-nullish-coalescing': ['warn'],
            '@typescript-eslint/no-inferrable-types': ['warn'],
            '@typescript-eslint/explicit-module-boundary-types': ['warn'],
        },
    },
    {
        ignores: ['node_modules'],
    },
];
