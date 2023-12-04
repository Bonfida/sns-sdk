import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import babel from "@rollup/plugin-babel";

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

  plugins: [
    typescript(),
    commonjs(),
    babel({ babelHelpers: "bundled" }),
    json(),
    nodeResolve({ browser: true, preferBuiltins: false }),
    replace({
      "process.env.NODE_ENV": JSON.stringify("production"),
      preventAssignment: false,
    }),
    terser(),
  ],
  onwarn: function (warning, handler) {
    if (warning.code === "THIS_IS_UNDEFINED") return;
    handler(warning);
  },
};
