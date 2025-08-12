import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [".next/", "components/ui/"],
  },
  ...compat.extends("next/core-web-vitals", "plugin:@typescript-eslint/recommended", "prettier"),
  {
    plugins: {
      "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        process: "readonly",
      },

      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: "module",

      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },

    rules: {
      curly: ["warn", "multi-line", "consistent"],
      "no-bitwise": "warn",
      "no-console": "off",
      "no-param-reassign": "warn",
      "no-shadow": "warn",
      "no-unused-vars": "off",
      "prefer-const": "warn",
      radix: ["warn", "always"],

      "spaced-comment": [
        "warn",
        "always",
        {
          line: {
            markers: ["/ <reference"],
          },
        },
      ],

      "react/no-unescaped-entities": [
        "warn",
        {
          forbid: [">", "}"],
        },
      ],

      "react/prop-types": "off",
      "@typescript-eslint/no-empty-function": "off",

      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  // Be less docmatic for config files
  {
    files: ["**/*.config.{mjs,js}"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
];
