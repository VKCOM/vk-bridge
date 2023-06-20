import { VKBridge, VKBridgeSend } from './types/bridge';
import { Middleware, MiddlewareAPI } from './types/middleware';

/**
 * Creates the VK Bridge enhancer that applies middleware to the `send`
 * method. This is handy for a variety of task such as logging every sent
 * event.
 *
 * @param middlewares The middleware chain to be applied.
 * @returns The VK Bridge enhancer applying the middleware.
 */
export function applyMiddleware(
  ...middlewares: Array<Middleware | undefined | null>
): (bridge: VKBridge) => VKBridge {
  if (middlewares.includes(undefined) || middlewares.includes(null)) {
    return applyMiddleware(
      ...middlewares.filter((item): item is Middleware => typeof item === 'function'),
    );
  }

  return (bridge) => {
    if (middlewares.length === 0) {
      return bridge;
    }

    let send: VKBridgeSend = () => {
      throw new Error(
        'Sending events while constructing your middleware is not allowed. ' +
          'Other middleware would not be applied to this send.',
      );
    };

    const middlewareAPI: MiddlewareAPI = {
      subscribe: bridge.subscribe,
      send: (...args) => bridge.send(...args),
    };

    const chain = middlewares
      .filter((item): item is Middleware => typeof item === 'function')
      .map((middleware) => middleware(middlewareAPI)) //
      .reduce((a, b) => (send) => a(b(send)));

    send = chain(bridge.send);

    return {
      ...bridge,
      send,
    };
  };
}
