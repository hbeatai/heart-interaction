const js = require("@eslint/js");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const globals = require("globals");

const baseStyleRules = {
  quotes: ["error", "double"],
  indent: ["error", 2],
  "max-len": ["error", { code: 120 }],
};

module.exports = [
  // Ignore patterns
  {
    ignores: [
      "lib/**/*",
      "node_modules/**/*",
      "eslint.config.*",
      "test/**/*",
    ],
  },

  // Base ESLint recommended config
  js.configs.recommended,

  // TypeScript files configuration
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ["./tsconfig.json"],
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // TypeScript ESLint recommended rules
      ...tsPlugin.configs.recommended.rules,

      // Allow unused variables/args/catch params prefixed with underscore
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      // Project style tweaks
      ...baseStyleRules,
    },
  },

  // JavaScript files configuration
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // Project style tweaks
      ...baseStyleRules,
    },
  },
];

