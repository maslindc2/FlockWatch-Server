import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default defineConfig([
  { ignores: ["docs/", "dist/", "coverage/", "createDB/", ".codenomad/", "init-mongo/", "node_modules/", "mutation/"] },
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { files: ["**/*.{js,mjs,cjs,ts}"], languageOptions: { globals: globals.node } },
  { files: ["**/*.{js,mjs,cjs,ts}"], plugins: { js }, extends: ["js/recommended"] },
  tseslint.configs.recommended,
  {
    rules: {
      "preserve-caught-error": "off",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
  {
    files: ["setup-jest.js", "tests/**/*"],
    languageOptions: { globals: globals.jest },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
]);
