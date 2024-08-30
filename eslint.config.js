let eslintConfigPrettier = require("eslint-config-prettier");
let eslint = require("@eslint/js");
let tseslint = require("typescript-eslint");

const ignoreUnusedUnderscoreRuleConfig = {
  argsIgnorePattern: "^_",
  caughtErrorsIgnorePattern: "^_",
  destructuredArrayIgnorePattern: "^_",
  varsIgnorePattern: "^_",
};

const base = {
  name: "customConfig",
  files: ["src/**/*.ts"],
  rules: {
    "no-unused-vars": ["error", ignoreUnusedUnderscoreRuleConfig],
    "@typescript-eslint/no-unused-vars": [
      "error",
      ignoreUnusedUnderscoreRuleConfig,
    ],
    "arrow-body-style": ["error", "as-needed"],
  },
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: __dirname,
    },
  },
};

const hardOverrides = {
  name: "hardOverrides",
  rules: {
    curly: ["error", "multi-or-nest", "consistent"],
  },
};

// Bottom overrides top
module.exports = [
  base,
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintConfigPrettier,
  hardOverrides,
];
