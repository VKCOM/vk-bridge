import { promisifySend } from './promisifier';
import { VKConnect, VKConnectSubscribeHandler, RequestMethodName, RequestProps, RequestIdProp } from './types/connect';
import { IS_CLIENT_SIDE, IS_IOS_WEBVIEW, IS_ANDROID_WEBVIEW, IS_WEB, DESKTOP_METHODS, EVENT_TYPE } from './constants';

/** Android VK Connect interface. */
const androidBridge: Record<string, (serializedData: string) => void> | undefined = IS_CLIENT_SIDE
  ? window.AndroidBridge
  : undefined;

/** iOS VK Connect interface. */
const iosBridge: Record<string, { postMessage?: (data: any) => void }> | undefined = IS_IOS_WEBVIEW
  ? window.webkit.messageHandlers
  : undefined;

/**
 * Creates a VK Connect API that holds functions for interact with runtime
 * environment.
 *
 * @param version Version of the package
 */
export const createVKConnect = (version: string): VKConnect => {
  /** Current frame id. */
  let webFrameId: number | undefined = undefined;

  /** List of functions that subscribed on events. */
  const subscribers: VKConnectSubscribeHandler[] = [];

  /**
   * Sends an event to the runtime env. In the case of Android/iOS application
   * env is the application itself. In the case of the browser, the parent
   * frame in which the event handlers is located.
   *
   * @param method The method (event) name to send
   * @param [props] Method properties
   */
  function send<K extends RequestMethodName>(method: K, props?: RequestProps<K> & RequestIdProp) {
    // Sending data through Android bridge
    if (androidBridge && androidBridge[method]) {
      androidBridge[method](JSON.stringify(props));
    }

    // Sending data through iOS bridge
    else if (iosBridge && iosBridge[method] && typeof iosBridge[method].postMessage === 'function') {
      iosBridge[method].postMessage!(props);
    }

    // Sending data through web bridge
    else if (IS_WEB) {
      parent.postMessage(
        {
          handler: method,
          params: props,
          type: 'vk-connect',
          webFrameId,
          connectVersion: version
        },
        '*'
      );
    }
  }

  /**
   * Adds an event listener. It will be called any time a data is received.
   *
   * @param listener A callback to be invoked on every event receive.
   */
  function subscribe(listener: VKConnectSubscribeHandler) {
    subscribers.push(listener);
  }

  /**
   * Removes an event listener which has been subscribed for event listening.
   *
   * @param listener A callback to unsubscribe.
   */
  function unsubscribe(listener: VKConnectSubscribeHandler) {
    const index = subscribers.indexOf(listener);

    if (index > -1) {
      subscribers.splice(index, 1);
    }
  }

  /**
   * Checks if a method is supported on runtime platform.
   *
   * @param method Method (event) name to check.
   * @returns Result of checking.
   */
  function supports(method: string): boolean {
    // Android support check
    if (IS_ANDROID_WEBVIEW) {
      return !!(androidBridge && typeof androidBridge[method] === 'function');
    }

    // iOS support check
    else if (IS_IOS_WEBVIEW) {
      return !!(iosBridge && iosBridge[method] && typeof iosBridge[method].postMessage === 'function');
    }

    // Web support check
    else if (IS_WEB) {
      return DESKTOP_METHODS.includes(method);
    }

    return false;
  }

  /**
   * Checks whether the runtime is a WebView.
   *
   * @returns Result of checking.
   */
  function isWebView(): boolean {
    return IS_IOS_WEBVIEW || IS_ANDROID_WEBVIEW;
  }

  // Subscribes to listening messages from a runtime for calling each
  // subscribed event listener.
  window.addEventListener(EVENT_TYPE, (event: any) => {
    // If it's webview
    if (IS_IOS_WEBVIEW || IS_ANDROID_WEBVIEW) {
      return [...subscribers].map(fn => fn.call(null, event));
    }

    // If it's web
    else if (IS_WEB && event && event.data) {
      const { type, data, frameId } = event.data;

      if (type && type === 'VKWebAppSettings') {
        webFrameId = frameId;
      } else {
        [...subscribers].map(fn => fn({ detail: { type, data } }));
      }
    }
  });

  /**
   * Enhanced send functions for the ability to receive response data in
   * the Promise object.
   */
  const sendPromise = promisifySend(send, subscribe);

  return {
    send: sendPromise,
    sendPromise,
    subscribe,
    unsubscribe,
    supports,
    isWebView
  };
};
