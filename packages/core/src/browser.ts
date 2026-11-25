import { createVKBridge } from './bridge.ts';
import { attachLoggerIfEnabled } from './logger/index.ts';
import pkg from '../package.json' with { type: 'json' };

// VK Bridge API (IIFE browser build)
const bridge = createVKBridge(pkg.version);

// Statically attach the logger when the activation flag is set. The IIFE
// build bundles the logger inline (no dynamic chunks), so we use the static
// attach path here instead of the dynamic-import path used by the ESM build.
attachLoggerIfEnabled(bridge);

// @ts-expect-error — global assignment for the IIFE browser build
window.vkBridge = window.vkConnect = bridge;
