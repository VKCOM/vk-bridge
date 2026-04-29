import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2020',
      dts: true,
      externalHelpers: true,
      source: {
        entry: {
          index: './src/index.ts',
        },
      },
    },
    {
      format: 'iife',
      syntax: 'es2020',
      bundle: true,
      source: {
        entry: {
          'browser.min': './src/browser.ts',
        },
      },
      output: {
        minify: {
          js: 'always',
        },
      },
      tools: {
        rspack: (config) => {
          config.output = {
            ...config.output,
            library: {
              type: 'window',
            },
          };
          return config;
        },
      },
    },
  ],
  source: {
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    sourceMap: true,
  },
});
