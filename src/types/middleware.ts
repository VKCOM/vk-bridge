import { VKConnectSend, VKConnectSubscribeHandler } from './connect';

/**
 * API that can use middleware.
 */
export interface MiddlewareAPI<
  S extends VKConnectSend = VKConnectSend,
  L extends VKConnectSubscribeHandler = VKConnectSubscribeHandler
> {
  send: S;
  subscribe(listener: L): void;
}

/**
 * A middleware is a higher-order function that composes a dispatch function
 * to return a new `send` function.
 */
export type Middleware<S extends VKConnectSend = VKConnectSend> = (api: MiddlewareAPI<S>) => (next: S) => S;
