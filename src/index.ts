import { createVKBridge } from './bridge';
import { version } from '../package.json';

// VK Bridge API run CI
const bridge = createVKBridge(version);

// Export typings
export * from './types/data';
export * from './types/bridge';
export * from './types/middleware';
export * from './types/deprecated';

export { applyMiddleware } from './applyMiddleware';
export { bridge as default };
