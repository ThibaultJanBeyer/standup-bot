const babel = require("@rollup/plugin-babel");
const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve");
const typescript = require("@rollup/plugin-typescript");
const json = require("@rollup/plugin-json");

module.exports = {
  input: "src/app.ts",
  output: {
    file: "dist/app.js",
    format: "cjs",
  },
  plugins: [
    typescript({
      tsconfig: "tsconfig.build.json",
    }),
    resolve({
      extensions: [".js", ".ts"],
    }),
    commonjs(),
    json(),
    babel({
      babelHelpers: "bundled",
      extensions: [".js", ".ts"],
    }),
  ],
};
