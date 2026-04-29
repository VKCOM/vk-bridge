import bridge from './index.ts';

// @ts-expect-error
window.vkBridge = window.vkConnect = bridge;
