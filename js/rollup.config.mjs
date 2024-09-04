import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import babel from "@rollup/plugin-babel";
import { visualizer } from "rollup-plugin-visualizer";
import multiInput from "rollup-plugin-multi-input";
import inject from "@rollup/plugin-inject";

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
    "src/nft/**/*.ts",
    "src/bindings/**/*.ts",
    "src/instructions/**/*.ts",
  ],
  output: [
    {
      dir: "dist/esm",
      format: "esm",
      sourcemap: true,
      entryFileNames: "[name].mjs",
      exports: "named",
      preserveModules: true,
      preserveModulesRoot: "src",
    },
    {
      dir: "dist/cjs",
      format: "cjs",
      sourcemap: true,
      entryFileNames: "[name].cjs",
      exports: "named",
      preserveModules: true,
      preserveModulesRoot: "src",
    },
  ],
  external: [
    "@solana/web3.js",
    "@solana/buffer-layout-utils",
    "@solana/buffer-layout",
  ],
  plugins: [
    multiInput.default(),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      dedupe: [
        "borsh",
        "@solana/spl-token",
        "bn.js",
        "buffer",
        "@solana/buffer-layout-utils",
        "@solana/buffer-layout",
      ],
    }),
    commonjs(),
    inject({
      Buffer: ["buffer", "Buffer"],
    }),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false,
      outDir: null,
      declarationDir: null,
    }),
    babel({ babelHelpers: "bundled" }),
    json(),
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
