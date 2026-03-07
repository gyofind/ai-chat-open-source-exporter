import js from "@eslint/js";
import prettier from "eslint-plugin-prettier/recommended";
import globals from "globals";

export default [
  js.configs.recommended, // Recommended ESLint rules for JavaScript
  prettier, // Integrates Prettier with ESLint
  {
    languageOptions: {
      ecmaVersion: "latest", // Use the latest ECMAScript features
      sourceType: "module", // Enable ES modules (import/export)
      globals: {
        ...globals.browser, // Browser globals (e.g., window, document)
        ...globals.node, // Node.js globals (e.g., process, __dirname)
        ...globals.webextensions, // WebExtensions globals (e.g., browser, chrome)
        chrome: "readonly", // Explicitly declare chrome as a global
        browser: "readonly", // Explicitly declare browser as a global (for Firefox)
      },
    },
    rules: {
      // Possible errors
      "no-console": "warn", // Warn about console statements
      "no-unused-vars": "warn", // Warn about unused variables
      "no-undef": "error", // Error on undefined variables

      // Best practices
      eqeqeq: ["error", "always"], // Enforce strict equality (===)
      curly: ["error", "multi-line"], // Enforce curly braces for multi-line blocks
      "no-var": "error", // Disallow var, use let/const
      "prefer-const": "error", // Prefer const over let for variables that don’t change

      // Prettier integration
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto", // Line endings based on OS
          printWidth: 80, // Line length
          tabWidth: 2, // Indent size
          useTabs: false, // Use spaces instead of tabs
          semi: true, // Require semicolons
          singleQuote: false, // Use double quotes
          trailingComma: "es5", // Add trailing commas where valid
        },
      ],
    },
  },
];
