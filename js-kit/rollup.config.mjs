import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import del from "rollup-plugin-delete";
import multiInput from "rollup-plugin-multi-input";
import { visualizer } from "rollup-plugin-visualizer";

/**
 * @type {import('rollup').RollupOptions}
 */
export default {
  input: [
    "src/codecs.ts",
    "src/errors.ts",
    "src/account/**/*.ts",
    "src/domain/**/*.ts",
    "src/nft/**/*.ts",
    "src/states/**/*.ts",
    "src/types/**/*.ts",
    "src/utils/**/*.ts",
  ],
  output: [
    {
      dir: "dist",
      format: "cjs",
      sourcemap: true,
      entryFileNames: "cjs/[name].cjs",
      exports: "named",
      preserveModules: true,
      preserveModulesRoot: "src",
    },
    {
      dir: "dist",
      format: "esm",
      sourcemap: true,
      entryFileNames: "esm/[name].mjs",
      exports: "named",
      preserveModules: true,
      preserveModulesRoot: "src",
    },
  ],
  external: [
    "@solana/kit",
    "@solana/addresses",
    "@solana/codecs-core",
    "@solana/codecs-strings",
    "@solana/errors",
  ],
  plugins: [
    del({ targets: "dist" }),
    multiInput(),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
      dedupe: [
        "@scure/base",
        "@solana-program/token",
        "borsh",
        "ipaddr.js",
        "punycode",
      ],
    }),
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      outDir: null,
      declarationDir: "dist/types",
    }),
    babel({ babelHelpers: "bundled" }),
    terser(),
    visualizer({
      gzipSize: true,
    }),
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
