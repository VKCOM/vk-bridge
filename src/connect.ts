import { version as connectVersion } from '../package.json';
import { createCustomEventClass } from './customEvent';
import { desktopEvents } from './desktopEvents';
import { SubscribeHandler, IOSBridge, AndroidBridge, RequestProps } from './types';
import { RequestMethodName } from './methods.js';

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

export const vkConnect = {
  /**
   * Sends a message to native client
   *
   * @example
   * message.send('VKWebAppInit');
   *
   * @param method The VK Connect method
   * @param [params] Message data
   */
  send<K extends RequestMethodName>(method: K, params: RequestProps<K> = <RequestProps<K>>{}) {
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
    if (!iosBridge && !androidBridge && desktopEvents.includes(method)) {
      return true;
    }

    return false;
  }
};

/**
 * Type of VK Connect interface
 */
export type VKConnect = typeof vkConnect;
