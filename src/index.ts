import { SubscribeHandler, IOSBridge, AndroidBridge, RequestProps, RequestMethodName } from './types';
import { version as connectVersion } from '../package.json';

/**
 * Events supported on the desktop
 */
const DESKTOP_EVENTS = [
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
const subscribers: SubscribeHandler[] = [];
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

const vkConnect = {
  /**
   * Sends a message to native client
   *
   * @example
   * message.send('VKWebAppInit');
   *
   * @param method The VK Connect method
   * @param [params] Message data object
   */
  send<K extends RequestMethodName>(method: K, params: RequestProps<K> = {} as RequestProps<K>) {
    if (androidBridge && typeof androidBridge[method] === 'function') {
      androidBridge[method](JSON.stringify(params));
    }
    if (iosBridge && iosBridge[method] && typeof iosBridge[method].postMessage === 'function') {
      iosBridge[method].postMessage!(params);
    }

    if (isWeb) {
      parent.postMessage(
        {
          handler: method,
          params,
          type: 'vk-connect',
          webFrameId,
          connectVersion
        },
        '*'
      );
    }
  },

  /**
   * Subscribe on VKWebAppEvent
   *
   * @param fn Event handler
   */
  subscribe(fn: SubscribeHandler) {
    subscribers.push(fn);
  },

  /**
   * Unsubscribe on VKWebAppEvent
   *
   * @param fn Event handler
   */
  unsubscribe(fn: SubscribeHandler) {
    const index = subscribers.indexOf(fn);

    if (index > -1) {
      subscribers.splice(index, 1);
    }
  },

  /**
   * Checks if it is client webview
   */
  isWebView(): boolean {
    return !!(androidBridge || iosBridge);
  },

  /**
   * Checks if native client supports handler
   *
   * @param method The VK Connect method
   */
  supports(method: string): boolean {
    // Android support check
    if (androidBridge && typeof (androidBridge as any)[method] === 'function') {
      return true;
    }

    // iOS support check
    if (iosBridge && (iosBridge as any)[method] && typeof (iosBridge as any)[method].postMessage === 'function') {
      return true;
    }

    // Web support check
    if (!iosBridge && !androidBridge && DESKTOP_EVENTS.includes(method)) {
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
export * from './types';

// Export VK Connect API
export default vkConnect;
