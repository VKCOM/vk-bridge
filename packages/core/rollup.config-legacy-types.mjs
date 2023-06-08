import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';
import tsc3_8_3 from 'typescript-3.8.3';

const INPUT_FILE = './src/index.ts';

/**
 * Для обратной совместимости, собираем типы для Typescript 3.8.3 (это была последняя версия на
 * момент обновления).
 *
 * Это предотвратит использование в библиотеке новых возможностей, которые сломают типы у
 * пользователей, которые используют TS < 4.0.0.
 *
 * TODO [>=3]: Удалить:
 *  1. этот файл;
 *  2. скрипт `build:legacy-types` в `package.json` и его использование;
 *  3. удалить поле `typeVersions` в `package.json`;
 *  4. удалить версию 3.8.3 через `yarn remove typescript-3.8.3`.
 *  5. удалить отключение правила `@typescript-eslint/prefer-ts-expect-error` в `.eslintrc.json`
 *  6. удалить отключение правила `"@typescript-eslint/ban-ts-comment"` в `.eslintrc.json`
 */
export default {
  plugins: [
    typescript({
      typescript: tsc3_8_3,
      useTsconfigDeclarationDir: true,
      tsconfigOverride: {
        compilerOptions: {
          noEmit: true,
          declaration: true,
          declarationDir: 'dist/types3.8.3',
        },
        exclude: ['**/dist', '**/*.test.ts'],
      },
    }),
    json(),
  ],
  input: INPUT_FILE,
  output: {},
};
