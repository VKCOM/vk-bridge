import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';
import bundleSize from 'rollup-plugin-bundle-size';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import pkg from './package.json';

const IS_PROD = process.env.NODE_ENV === 'production';

const INPUT_FILE = './src/index.ts';
const INPUT_FILE_BROWSER = './src/browser.ts';
const OUTPUT_FILE_BROWSER = './dist/browser.min.js';

const getPlugins = (tsDeclaration = false) => [
  typescript(
    tsDeclaration
      ? {
          useTsconfigDeclarationDir: true,
          tsconfigOverride: {
            compilerOptions: {
              declaration: true,
              declarationDir: 'dist/types'
            }
          }
        }
      : {}
  ),
  babel(),
  json(),
  nodeResolve({ mainFields: ['module', 'jsnext'] }),
  commonjs({ include: 'node_modules/**' }),
  bundleSize()
];

const cjs = {
  plugins: IS_PROD ? [...getPlugins(true), uglify()] : getPlugins(true),
  input: INPUT_FILE,
  output: {
    exports: 'named',
    file: pkg.main,
    format: 'cjs'
  }
};

const es = {
  plugins: getPlugins(),
  input: INPUT_FILE,
  output: {
    file: pkg.module,
    format: 'es'
  }
};

const umd = {
  plugins: IS_PROD ? [...getPlugins(), uglify()] : getPlugins(),
  input: INPUT_FILE,
  output: {
    exports: 'named',
    name: pkg.umdName,
    file: pkg.browser,
    format: 'umd'
  }
};

const browser = {
  plugins: [...getPlugins(), uglify()],
  input: INPUT_FILE_BROWSER,
  output: {
    file: OUTPUT_FILE_BROWSER,
    format: 'iife'
  }
};

export default IS_PROD ? [cjs, es, umd, browser] : umd;
