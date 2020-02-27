import bridge, { applyMiddleware } from './index';

// @ts-ignore
window.vkBridge = window.vkConnect = bridge;
// @ts-ignore
window.vkBridgeApplyMiddleware = applyMiddleware;
