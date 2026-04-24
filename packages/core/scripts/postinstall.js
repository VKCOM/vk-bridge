#!/usr/bin/env node

const currentVersion = require('../package.json').version;

// Показываем только для v2.x.x
if (!currentVersion.startsWith('2.')) {
  process.exit(0);
}

console.warn(`
⚠️  IMPORTANT NOTICE!

You are using @vkontakte/vk-bridge@${currentVersion}

The upcoming major release 3.0.0 will introduce BREAKING CHANGES:
  • ESM-only — the package will be published as ES modules only (CommonJS/require is not officially supported)
  • TypeScript 4.0+ — support for TS 3.x will be dropped
  • Enum removal — use string values instead of EAdsFormats.REWARD

We recommend preparing in advance:
  • Upgrade TypeScript to version 4.0 or higher
  • Replace require() with import in your codebase
  • Check your code for enum usage
`);
