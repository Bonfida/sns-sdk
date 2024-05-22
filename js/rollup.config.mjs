import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import babel from "@rollup/plugin-babel";
import { visualizer } from "rollup-plugin-visualizer";
import multiInput from 'rollup-plugin-multi-input';

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: [
    "src/index.ts",
    "src/record_v2/**/*.ts",
    "src/utils/**/*.ts",
    "src/twitter/**/*.ts",
    "src/resolve/**/*.ts",
    "src/record/**/*.ts",
    "src/bindings/**/*.ts",
    "src/instructions/**/*.ts",
  ],
  treeshake: true,
  output: [
    {
      dir: "dist/",
      format: "esm",
      sourcemap: true,
      entryFileNames: '[name].mjs',
      exports: "named"
    },
    { dir: "dist/", format: "cjs", sourcemap: true },
  ],
  external: ["@solana/web3.js"],
  plugins: [
    multiInput.default(),
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
  treeshake: {
    moduleSideEffects: false,
    preset: "smallest",
  },
  onwarn: function (warning, handler) {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    handler(warning);
  },
};
