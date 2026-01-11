 
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
 
const compat = new FlatCompat({
  baseDirectory: __dirname,
});
 
const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
    rules: {
      // ✅ Turn off the "no-explicit-any" rule globally
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      "@typescript-eslint/no-unused-vars": "off",
      
 
      // ✅ Or if you prefer, change it to a warning instead of error
      // "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
 
export default eslintConfig;
 
 