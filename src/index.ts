import {
  IOSBridge,
  AndroidBridge,
  RequestMethodName,
  RequestPropsMap,
  VKConnectSubscribeHandler,
  VKConnectSend,
  VKConnectSubscribeOrUnsubscribe,
  VKConnectSendPromise
} from './types';
import { version as connectVersion } from '../package.json';
import { promisifySend } from './promisifier';

/**
 * Methods supported on the desktop
 */
const DESKTOP_METHODS = [
  'VKWebAppInit',
  'VKWebAppGetCommunityAuthToken',
  'VKWebAppAddToCommunity',
  'VKWebAppGetUserInfo',
  'VKWebAppSetLocation',
  'VKWebAppGetClientVersion',
  'VKWebAppGetPhoneNumber',
  'VKWebAppGetEmail',
  'VKWebAppGetGeodata',
  'VKWebAppSetTitle',
  'VKWebAppGetAuthToken',
  'VKWebAppCallAPIMethod',
  'VKWebAppJoinGroup',
  'VKWebAppAllowMessagesFromGroup',
  'VKWebAppDenyNotifications',
  'VKWebAppAllowNotifications',
  'VKWebAppOpenPayForm',
  'VKWebAppOpenApp',
  'VKWebAppShare',
  'VKWebAppShowWallPostBox',
  'VKWebAppScroll',
  'VKWebAppResizeWindow',
  'VKWebAppShowOrderBox',
  'VKWebAppShowLeaderBoardBox',
  'VKWebAppShowInviteBox',
  'VKWebAppShowRequestBox',
  'VKWebAppAddToFavorites'
];

/**
 * Creates the CustomEvent ponyfill. VK clients use the CustomEvents to transfer data.
 */
const createCustomEventClass = () => {
  function CustomEvent<T>(typeArg: string, eventInitDict?: CustomEventInit<T>): CustomEvent<T> {
    const params = eventInitDict || { bubbles: false, cancelable: false, detail: undefined };

    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(typeArg, !!params.bubbles, !!params.cancelable, params.detail);

    return evt;
  }

  CustomEvent.prototype = Event.prototype;

  return CustomEvent;
};

/**
 * List of functions that subscribed on events
 */
const subscribers: VKConnectSubscribeHandler[] = [];
let webFrameId: number | null = null;

const isBrowser = typeof window !== 'undefined';

const isIOSClientWebView =
  isBrowser &&
  window.webkit &&
  window.webkit.messageHandlers !== undefined &&
  window.webkit.messageHandlers.VKWebAppClose !== undefined;

const androidBridge: AndroidBridge | undefined = isBrowser ? (window.AndroidBridge as AndroidBridge) : undefined;
const iosBridge: IOSBridge | undefined = isIOSClientWebView ? window.webkit.messageHandlers : undefined;

const isWeb = isBrowser && !androidBridge && !iosBridge;
const eventType = isWeb ? 'message' : 'VKWebAppEvent';

if (isBrowser) {
  // Polyfill
  if (!window.CustomEvent) {
    (window as any).CustomEvent = createCustomEventClass();
  }

  window.addEventListener(eventType, (...args) => {
    const _subscribers = [...subscribers];

    if (isWeb && args[0] && 'data' in args[0]) {
      const { webFrameId: _, connectVersion, ...data } = (args[0] as any).data; // FIXME

      if (data.type && data.type === 'VKWebAppSettings') {
        webFrameId = data.frameId;
      } else {
        _subscribers.forEach(fn => {
          fn({ detail: data });
        });
      }
    } else {
      _subscribers.forEach(fn => {
        fn.apply(null, args as any); // FIXME
      });
    }
  });
}

/**
 * The send function
 */
const send: VKConnectSend = <K extends RequestMethodName>(
  method: K,
  props: RequestPropsMap[K] = {} as RequestPropsMap[K]
): void => {
  if (androidBridge && typeof androidBridge[method] === 'function') {
    androidBridge[method](JSON.stringify(props));
  }
  if (iosBridge && iosBridge[method] && typeof iosBridge[method].postMessage === 'function') {
    iosBridge[method].postMessage!(props);
  }

  if (isWeb) {
    parent.postMessage(
      {
        handler: method,
        params: props,
        type: 'vk-connect',
        webFrameId,
        connectVersion
      },
      '*'
    );
  }
};

/**
 * The subscribe function
 */
const subscribe: VKConnectSubscribeOrUnsubscribe = (fn: VKConnectSubscribeHandler) => {
  subscribers.push(fn);
};

/**
 * The send function that returns promise
 */
const sendPromise: VKConnectSendPromise = promisifySend(send, subscribe);

/**
 * VK connect
 */
const vkConnect = {
  /**
   * Sends a VK Connect method to client
   *
   * @example
   * message.send('VKWebAppInit');
   *
   * @param method The VK Connect method
   * @param [props] Method props object
   */
  send,

  /**
   * Subscribe on VKWebAppEvent
   *
   * @param fn Event handler
   */
  subscribe,

  /**
   * Sends a VK Connect method to client and returns a promise of response data
   *
   * @param method The VK Connect method
   * @param [props] Method props object
   * @returns Promise of response data
   */
  sendPromise,

  /**
   * Unsubscribe on VKWebAppEvent
   *
   * @param fn Event handler
   */
  unsubscribe: (fn: VKConnectSubscribeHandler) => {
    const index = subscribers.indexOf(fn);

    if (index > -1) {
      subscribers.splice(index, 1);
    }
  },

  /**
   * Checks if it is client webview
   */
  isWebView: (): boolean => {
    return !!(androidBridge || iosBridge);
  },

  /**
   * Checks if native client supports handler
   *
   * @param method The VK Connect method
   */
  supports: (method: string): boolean => {
    // Android support check
    if (androidBridge && typeof (androidBridge as any)[method] === 'function') {
      return true;
    }

    // iOS support check
    if (iosBridge && (iosBridge as any)[method] && typeof (iosBridge as any)[method].postMessage === 'function') {
      return true;
    }

    // Web support check
    if (!iosBridge && !androidBridge && DESKTOP_METHODS.includes(method)) {
      return true;
    }

    return false;
  }
};

/**
 * Type of VK Connect interface
 */
export type VKConnect = typeof vkConnect;

// UMD exports
if (typeof exports !== 'object' || typeof module === 'undefined') {
  let root:
    | (typeof globalThis | Window | NodeJS.Global) & { vkConnect?: VKConnect; vkuiConnect?: VKConnect }
    | null = null;

  if (typeof window !== 'undefined') {
    root = window;
  } else if (typeof global !== 'undefined') {
    root = global;
  } else if (typeof self !== 'undefined') {
    root = self;
  }

  if (root) {
    root.vkConnect = vkConnect;

    // Backward compatibility
    root.vkuiConnect = vkConnect;
  }
}

// Export typings
export * from './types';

// Export VK Connect API
export default vkConnect;
