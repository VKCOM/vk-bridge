import { createVKBridge } from './bridge';
import { createCustomEventPolyfill } from './custom-event';
import { version } from '../package.json';
import './custom-event';

// Applying CustomEvent polyfill
if (typeof window !== 'undefined' && !window.CustomEvent) {
  (window as any).CustomEvent = createCustomEventPolyfill();
}

// VK Bridge API
const bridge = createVKBridge(version);

// Export typings
export * from './types/data';
export * from './types/bridge';
export * from './types/middleware';
export * from './types/deprecated';

export { applyMiddleware } from './applyMiddleware';
export { bridge as default };
