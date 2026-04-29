import { createVKBridge } from './bridge.ts';
import pkg from '../package.json' with { type: 'json' };

// VK Bridge API
const bridge = createVKBridge(pkg.version);

// Export typings
export type * from './types/data.ts';
export type * from './types/bridge.ts';
export type * from './types/middleware.ts';
export type * from './types/deprecated.ts';

export { applyMiddleware } from './applyMiddleware.ts';

export { parseURLSearchParamsForGetLaunchParams } from './parseURLSearchParamsForGetLaunchParams.ts';

export { bridge as default };
