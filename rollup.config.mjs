import * as dotenv from "dotenv-flow";
dotenv.config();

import typescript from "@rollup/plugin-typescript";
import externals from "rollup-plugin-node-externals";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import cleanup from "rollup-plugin-cleanup";
import { terser } from "rollup-plugin-terser";
import shebang from "rollup-plugin-add-shebang";
import execute from "rollup-plugin-execute";

const { NODE_ENV = "dev" } = process.env;
const isProd = NODE_ENV == "prod";
const rollup = [];

rollup.push({
  input: "src/cli.ts",
  output: { file: `dist/cli.js`, format: "cjs" },
  plugins: [
    typescript({ include: ["src/**/*.ts"], resolveJsonModule: true }),
    externals(),
    commonjs(),
    json(),
    nodeResolve(),
    shebang(),
    isProd && cleanup(),
    isProd && terser(),
    !isProd &&
      execute("yarn global add file:/Users/louis/code/publishkit/pk-cli"),
  ],
});

export default rollup;
