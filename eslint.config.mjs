import { FlatCompat } from "@eslint/eslintrc";

// Use the ESM-native directory. This is used only by ESLint tooling.
const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [...compat.extends("next/core-web-vitals")];

export default eslintConfig;
