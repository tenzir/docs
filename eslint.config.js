import eslintPluginAstro from "eslint-plugin-astro";
import * as tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  // Base configuration for all files

  {
    ignores: [
      "dist/",
      ".astro/",
      "node_modules/",
      "*.d.ts",
      ".vscode/",
      ".idea/",
      ".DS_Store",
      "Thumbs.db",
      "*.log",
      ".env",
      ".env.local",
      ".env.production",
      "tsconfig.tsbuildinfo",
      "pnpm-lock.yaml",
      "package-lock.json",
      "yarn.lock",
      "**/*.py",
    ],
  },

  // Configuration for JavaScript and TypeScript files
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: null, // Disable type-aware linting for performance
        allowImportExportEverywhere: true,
        ecmaFeatures: {
          globalReturn: false,
          impliedStrict: true,
        },
      },
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // TypeScript recommended rules
      ...tsPlugin.configs.recommended.rules,

      // Custom rules
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // Configuration for Astro files
  ...eslintPluginAstro.configs.recommended,
  {
    files: ["**/*.astro"],
    rules: {
      // Astro-specific rule overrides
      "astro/no-set-html-directive": "error",
      "astro/no-unused-css-selector": "off", // Turn off as it can have false positives
    },
  },

  // Special handling for config files with import assertions
  {
    files: ["astro.config.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
  },
];
