import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { visualizer } from "rollup-plugin-visualizer";

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
  external: ["react", "react-dom", "@tanstack/react-query", "@solana/web3.js"],
  plugins: [
    nodeResolve({ browser: true, preferBuiltins: false }),
    typescript(),
    commonjs(),
    babel({ babelHelpers: "bundled" }),
    terser(),
    visualizer(),
  ],
};
