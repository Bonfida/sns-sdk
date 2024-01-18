import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import babel from "@rollup/plugin-babel";
import { visualizer } from "rollup-plugin-visualizer";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/index.mjs",
      format: "esm",
      sourcemap: true,
    },
    { file: "dist/index.cjs", format: "cjs", sourcemap: true },
  ],
  external: ["@solana/web3.js"],
  plugins: [
    typescript(),
    commonjs(),
    babel({ babelHelpers: "bundled" }),
    json(),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      dedupe: ["borsh", "@solana/spl-token", "bn.js", "buffer"],
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production"),
      preventAssignment: false,
    }),
    terser(),
    visualizer(),
  ],
  onwarn: function (warning, handler) {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    handler(warning);
  },
};
