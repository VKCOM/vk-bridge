import { vkConnect, VKConnect } from './connect';

// UMD exports
if (typeof exports !== 'object' || typeof module === 'undefined') {
  let root: (typeof globalThis | Window | NodeJS.Global) & { vkConnect?: VKConnect; vkuiConnect?: VKConnect };

  if (typeof window !== 'undefined') {
    root = window;
  } else if (typeof global !== 'undefined') {
    root = global;
  } else if (typeof self !== 'undefined') {
    root = self;
  } else {
    root = this;
  }

  root.vkConnect = vkConnect;

  // Backward compatibility
  root.vkuiConnect = vkConnect;
}

// Export typings
export { VKConnect };
export * from './types';
export * from './methods';

export default vkConnect;
