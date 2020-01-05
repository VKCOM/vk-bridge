import { createVKConnect } from './connect';
import { createCustomEventPolyfill } from './custom-event';
import { version } from '../package.json';
import './custom-event';

// Applying CustomEvent polyfill
if (typeof window !== 'undefined' && !window.CustomEvent) {
  (window as any).CustomEvent = createCustomEventPolyfill();
}

// Export typings
export * from './types/data';
export * from './types/connect';

// Export VK Connect API
export default createVKConnect(version);
