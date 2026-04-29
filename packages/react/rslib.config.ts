import { defineConfig } from '@rslib/core';

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: 'es2020',
      dts: true,
      externalHelpers: true,
    },
  ],
  source: {
    tsconfigPath: './tsconfig.lib.json',
  },
  output: {
    sourceMap: true,
  },
});
