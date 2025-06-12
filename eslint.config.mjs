import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";


export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"] },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
  {languageOptions: { globals: globals.jest }},
  { rules:
      {
        // "@typescript-eslint/no-unused-vars": [
        //     "error",
        //     { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
        // ],
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": "warn",
        '@typescript-eslint/no-explicit-any': 'off',
        "react/react-in-jsx-scope": "off",
        "react/jsx-uses-react": "off"
    },
  },
  pluginReact.configs.flat.recommended,
]);
