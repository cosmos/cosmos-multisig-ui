/* global module */
module.exports = {
  env: {
    es6: true,
    browser: true,
  },
  globals: {
    process: "readonly",
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ["prettier"],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "prettier",
    "plugin:prettier/recommended",
  ],
  rules: {
    curly: ["warn", "multi-line", "consistent"],
    "no-bitwise": "warn",
    "no-console": "off",
    "no-param-reassign": "warn",
    "no-shadow": "warn",
    "no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "prefer-const": "warn",
    radix: ["warn", "always"],
    "spaced-comment": ["warn", "always"],
    "react/no-unescaped-entities": ["warn", { forbid: [">", "}"] }], // by default we can't use ' which is annoying
    "react/prop-types": "off", // we take care of this with TypeScript
  },
  overrides: [],
};
