let eslintConfigPrettier = require("eslint-config-prettier");
let eslint = require("@eslint/js");
let tseslint = require("typescript-eslint");

const ignoreUnusedUnderscoreRuleConfig = {
  argsIgnorePattern: "^_",
  caughtErrorsIgnorePattern: "^_",
  destructuredArrayIgnorePattern: "^_",
  varsIgnorePattern: "^_",
};

const customConfig = {
  name: "customConfig",
  files: ["src/**/*.ts"],
  rules: {
    "no-unused-vars": ["error", ignoreUnusedUnderscoreRuleConfig],
    "@typescript-eslint/no-unused-vars": ["error", ignoreUnusedUnderscoreRuleConfig],
  },
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: __dirname,
    },
  },
};

// Top overrides bottom
module.exports = [
  customConfig,
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintConfigPrettier,
];
