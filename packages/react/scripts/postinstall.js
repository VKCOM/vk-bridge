#!/usr/bin/env node

const currentVersion = require('../package.json').version;

if (!currentVersion.startsWith('1.')) {
  process.exit(0);
}

console.warn(`
⚠️  IMPORTANT NOTICE!

You are using @vkontakte/vk-bridge-react@${currentVersion}

The upcoming major release 2.0.0 will introduce BREAKING CHANGES:
  • Requires @vkontakte/vk-bridge@^3.0.0
  • ESM-only — follows the core package (CommonJS/require is not officially supported)
  • TypeScript 4.0+ — minimum supported version is increased

We recommend preparing in advance:
  • Upgrade @vkontakte/vk-bridge to version 3.0.0
  • Upgrade TypeScript to version 4.0 or higher
  • Update both packages together
`);
