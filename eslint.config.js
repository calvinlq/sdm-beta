import globals from "globals";
import js from "@eslint/js";
import vue from "eslint-plugin-vue";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import vueParser from "vue-eslint-parser";

export default [
  {
    ignores: [
      "node_modules/",
      "dist/",
      "bun.lock",
      ".DS_Store",
      "*.local",
      "*.log*",
      ".rspack-profile-*/",
      ".vscode/*",
      "!.vscode/extensions.json",
      ".idea",
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
  js.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        parser: {
          ts: tsParser,
          js: "espree",
        },
      },
    },
    plugins: {
      vue,
    },
    rules: {
      ...vue.configs.base.rules,
      "vue/multi-word-component-names": "warn",
      "vue/no-unused-components": "warn",
      "vue/no-unused-vars": "warn",
    },
  },
  {
    rules: {
      "no-console": "warn",
      "no-debugger": "warn",
    },
  },
];
