import { createVKConnect } from './connect';
import { version } from '../package.json';
import './custom-event-polyfill';

// Export typings
export * from './types/data';
export * from './types/connect';

// Export VK Connect API
export default createVKConnect(version);
