import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated Prisma / tooling files that are not app source.
    "**/contract.d.ts",
    "migrations/**",
    ".agents/**",
    ".claude/**",
    ".cursor/**",
    ".devin/**",
  ]),
]);

export default eslintConfig;
