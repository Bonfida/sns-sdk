import typescript from "@rollup/plugin-typescript";
import terser from '@rollup/plugin-terser';

export default {
  input: "src/index.tsx",
  output: [
    {
      file: "dist/index.cjs",
      format: "cjs",
      sourcemap: true,
    },
    {
      file: "dist/index.mjs",
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [typescript(), terser()],
};
