import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import bundleSizes from 'rollup-plugin-bundle-size';
import json from '@rollup/plugin-json';
import pkg from './package.json' assert { type: 'json' };

const IS_PROD = process.env.NODE_ENV === 'production';

const INPUT_FILE = './src/index.ts';

const getPlugins = (tsDeclaration = false) => [
  typescript(
    tsDeclaration
      ? {
          useTsconfigDeclarationDir: true,
          tsconfigOverride: {
            compilerOptions: {
              declaration: true,
              declarationDir: 'dist/types',
            },
            exclude: ['**/dist', '**/*.test.ts'],
          },
        }
      : {},
  ),
  babel({ babelHelpers: 'bundled' }),
  json(),
  nodeResolve({ mainFields: ['module', 'jsnext'] }),
  commonjs({ include: 'node_modules/**' }),
  bundleSizes(),
];

const cjs = {
  plugins: IS_PROD ? [...getPlugins(true), terser()] : getPlugins(true),
  input: INPUT_FILE,
  output: {
    sourcemap: true,
    exports: 'named',
    file: pkg.main,
    format: 'cjs',
  },
  external: ['react', '@vkontakte/vk-bridge'],
};

const es = {
  plugins: getPlugins(),
  input: INPUT_FILE,
  output: {
    sourcemap: true,
    file: pkg.module,
    format: 'es',
  },
  external: ['react', '@vkontakte/vk-bridge'],
};

export default IS_PROD ? [cjs, es] : es;
