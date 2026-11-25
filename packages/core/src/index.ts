import { createVKBridge } from './bridge.ts';
import pkg from '../package.json' with { type: 'json' };
import { autoAttachLogger } from './logger/auto.ts';

// VK Bridge API
const bridge = createVKBridge(pkg.version);

// Enable the QA logger when an activation flag is present (localStorage or
// vk_log=1 in the URL). The heavy panel UI is loaded via dynamic import, so
// it does not bloat the main bundle when logging is disabled.
autoAttachLogger(bridge);

// Export typings
export type * from './types/data.ts';
export type * from './types/bridge.ts';
export type * from './types/middleware.ts';
export type * from './types/deprecated.ts';

export { applyMiddleware } from './applyMiddleware.ts';

export { parseURLSearchParamsForGetLaunchParams } from './parseURLSearchParamsForGetLaunchParams.ts';

export { bridge as default };
