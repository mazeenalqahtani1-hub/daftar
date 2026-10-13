import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/routeTree.gen.ts",
      "supabase/**",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-non-null-assertion": "error",
      "@typescript-eslint/no-explicit-any": "error",
      eqeqeq: ["error", "always"],
      "no-console": "error",
      // Money must never be computed with floating-point shortcuts by accident.
      "no-restricted-properties": [
        "error",
        {
          object: "Number",
          property: "parseFloat",
          message: "Money is integer halalas: do not parse floats.",
        },
      ],
    },
  },
  // Plain JS/config files: no type information available.
  {
    files: ["**/*.{js,cjs,mjs}", "**/vite.config.ts", "**/vitest.config.ts", "**/tsup.config.ts"],
    ...tseslint.configs.disableTypeChecked,
  },
  {
    files: ["**/*.{js,cjs,mjs}", "scripts/**"],
    languageOptions: { globals: globals.node },
    rules: { "no-console": "off" },
  },
  // Web (browser)
  {
    files: ["apps/web/**/*.{ts,tsx}"],
    languageOptions: { globals: globals.browser },
    plugins: { "react-hooks": reactHooks, "react-refresh": reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  // TanStack file routes must export `Route` next to their component.
  {
    files: ["apps/web/src/app/routes/**/*.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  // Server code and tests
  {
    files: ["apps/api/**/*.ts", "apps/worker/**/*.ts", "packages/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
  {
    files: ["**/*.test.{ts,tsx}"],
    rules: { "@typescript-eslint/no-non-null-assertion": "off" },
  },
  prettier,
);
