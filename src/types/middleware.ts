import { VKBridgeSend, VKBridgeSubscribeHandler } from './bridge';

/**
 * API that can use middleware.
 */
export interface MiddlewareAPI<
  S extends VKBridgeSend = VKBridgeSend,
  L extends VKBridgeSubscribeHandler = VKBridgeSubscribeHandler,
> {
  send: S;
  subscribe(listener: L): void;
}

/**
 * A middleware is a higher-order function that composes a dispatch function
 * to return a new `send` function.
 */
export type Middleware<S extends VKBridgeSend = VKBridgeSend> = (
  api: MiddlewareAPI<S>,
) => (next: S) => S;
