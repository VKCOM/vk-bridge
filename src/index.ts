import { createVKConnect } from './connect';
import { createCustomEventPolyfill } from './custom-event';
import { version } from '../package.json';
import { applyMiddleware } from './applyMiddleware';
import './custom-event';

// Applying CustomEvent polyfill
if (typeof window !== 'undefined' && !window.CustomEvent) {
  (window as any).CustomEvent = createCustomEventPolyfill();
}

// VK Connect API
const connect = createVKConnect(version);

// Export typings
export * from './types/data';
export * from './types/connect';
export * from './types/middleware';

// Named ESM export middleware types and `applyMiddleware` function
export { applyMiddleware } from './applyMiddleware';
// Default ESM export VK Connect API
export default connect;

// Mixed export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ...connect };
  module.exports.default = { ...connect };
  module.exports.applyMiddleware = applyMiddleware;
}
