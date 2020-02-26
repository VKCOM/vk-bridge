import { createVKBridge } from './bridge';
import { createCustomEventPolyfill } from './custom-event';
import { version } from '../package.json';
import { applyMiddleware } from './applyMiddleware';
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

// Named ESM export middleware types and `applyMiddleware` function
export { applyMiddleware } from './applyMiddleware';
// Default ESM export VK Bridge API
export default bridge;

// Mixed export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ...bridge };
  module.exports.default = { ...bridge };
  module.exports.applyMiddleware = applyMiddleware;
}
