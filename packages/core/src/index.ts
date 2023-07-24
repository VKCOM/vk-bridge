import { createVKBridge } from './bridge';
import { version } from '../package.json';

// VK Bridge API
const bridge = createVKBridge(version);

// Export typings
export * from './types/data';
export * from './types/bridge';
export * from './types/middleware';
export * from './types/deprecated';

export { applyMiddleware } from './applyMiddleware';

export { parseURLSearchParamsForGetLaunchParams } from './parseURLSearchParamsForGetLaunchParams';

export { bridge as default };
