/* global module */
module.exports = {
  env: {
    es6: true,
    browser: true,
  },
  globals: {
    process: "readonly",
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["@typescript-eslint"],
  extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended", "prettier"],
  rules: {
    curly: ["warn", "multi-line", "consistent"],
    "no-bitwise": "warn",
    "no-console": "off",
    "no-param-reassign": "warn",
    "no-shadow": "warn",
    "no-unused-vars": "off", // Use @typescript-eslint/no-unused-vars instead
    "prefer-const": "warn",
    radix: ["warn", "always"],
    "spaced-comment": ["warn", "always", { line: { markers: ["/ <reference"] } }],
    "react/no-unescaped-entities": ["warn", { forbid: [">", "}"] }], // by default we can't use ' which is annoying
    "react/prop-types": "off", // we take care of this with TypeScript
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
};
