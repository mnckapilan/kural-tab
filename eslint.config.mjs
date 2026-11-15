import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

export default tseslint.config(
  // Base JS recommended rules
  js.configs.recommended,

  // TypeScript recommended rules (type-aware)
  ...tseslint.configs.recommendedTypeChecked,

  // React rules
  {
    plugins: { react: reactPlugin },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      "react/react-in-jsx-scope": "off", // Not needed with React 17+ JSX transform
      "react/prop-types": "off", // We use TypeScript for prop types
    },
    settings: {
      react: { version: "detect" },
    },
  },

  // Rules of Hooks, exhaustive-deps and the React Compiler-era rules
  reactHooks.configs.flat.recommended,

  // Project-wide settings
  {
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Ignore build output, deps, and config files that aren't TS
  {
    ignores: [".output/", ".wxt/", "node_modules/", "eslint.config.mjs"],
  },
);
