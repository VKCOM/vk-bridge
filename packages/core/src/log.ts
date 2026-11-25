/**
 * Opt-in entry for the VK Bridge logger.
 *
 * Mini-apps that want to enable logging explicitly (without relying on the
 * activation flag) can import from `@vkontakte/vk-bridge/log` and call
 * `attachLoggerIfEnabled(bridge)` or `attachLogger(bridge, tap)`.
 */
export { attachLogger, attachLoggerIfEnabled } from './logger/index.ts';
export type { VkBridgeLogGlobal } from './logger/index.ts';
export type { LogEntry, LoggerOptions, TapHandle } from './logger/types.ts';
