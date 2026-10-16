/**
 * Compatibility entry: the panel implementation lives in `panel/`.
 * Consumers (logger/index.ts, log.ts) keep importing from `./panel.ts`.
 */
export { copyText } from './panel/clipboard.ts';
export { mountPanel } from './panel/index.ts';
export type { PanelHandle, PanelSendFn } from './panel/index.ts';
