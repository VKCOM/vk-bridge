import { promisifySend } from './promisifySend';
import {
  VKBridge,
  VKBridgeSubscribeHandler,
  AnyRequestMethodName,
  RequestProps,
  RequestIdProp,
} from './types/bridge';

/** Is the client side runtime environment */
export const IS_CLIENT_SIDE = typeof window !== 'undefined';

/** Is the runtime environment an Android app */
export const IS_ANDROID_WEBVIEW = Boolean(IS_CLIENT_SIDE && (window as any).AndroidBridge);

/** Is the runtime environment an iOS app */
export const IS_IOS_WEBVIEW = Boolean(
  IS_CLIENT_SIDE &&
    (window as any).webkit &&
    (window as any).webkit.messageHandlers &&
    (window as any).webkit.messageHandlers.VKWebAppClose,
);

export const IS_REACT_NATIVE_WEBVIEW = Boolean(
  IS_CLIENT_SIDE &&
    (window as any).ReactNativeWebView &&
    typeof (window as any).ReactNativeWebView.postMessage === 'function',
);

/** Is the runtime environment a browser */
export const IS_WEB = IS_CLIENT_SIDE && !IS_ANDROID_WEBVIEW && !IS_IOS_WEBVIEW;

/** Is the runtime environment m.vk.com */
export const IS_MVK = IS_WEB && /(^\?|&)vk_platform=mobile_web(&|$)/.test(location.search);

/** Is the runtime environment vk.com */
export const IS_DESKTOP_VK = IS_WEB && !IS_MVK;

/** Type of subscribe event */
export const EVENT_TYPE = IS_WEB ? 'message' : 'VKWebAppEvent';

/** Methods supported on the desktop */
export const DESKTOP_METHODS = [
  'VKWebAppInit',
  'VKWebAppGetCommunityAuthToken',
  'VKWebAppAddToCommunity',
  'VKWebAppAddToHomeScreenInfo',
  'VKWebAppClose',
  'VKWebAppCopyText',
  'VKWebAppCreateHash',
  'VKWebAppGetUserInfo',
  'VKWebAppSetLocation',
  'VKWebAppSendToClient',
  'VKWebAppGetClientVersion',
  'VKWebAppGetPhoneNumber',
  'VKWebAppGetEmail',
  'VKWebAppGetGroupInfo',
  'VKWebAppGetGeodata',
  'VKWebAppGetCommunityToken',
  'VKWebAppGetConfig',
  'VKWebAppGetLaunchParams',
  'VKWebAppSetTitle',
  'VKWebAppGetAuthToken',
  'VKWebAppCallAPIMethod',
  'VKWebAppJoinGroup',
  'VKWebAppLeaveGroup',
  'VKWebAppAllowMessagesFromGroup',
  'VKWebAppDenyNotifications',
  'VKWebAppAllowNotifications',
  'VKWebAppOpenPayForm',
  'VKWebAppOpenApp',
  'VKWebAppShare',
  'VKWebAppShowWallPostBox',
  'VKWebAppScroll',
  'VKWebAppShowOrderBox',
  'VKWebAppShowLeaderBoardBox',
  'VKWebAppShowInviteBox',
  'VKWebAppShowRequestBox',
  'VKWebAppAddToFavorites',
  'VKWebAppShowStoryBox',
  'VKWebAppStorageGet',
  'VKWebAppStorageGetKeys',
  'VKWebAppStorageSet',
  'VKWebAppFlashGetInfo',
  'VKWebAppSubscribeStoryApp',
  'VKWebAppOpenWallPost',
  'VKWebAppCheckAllowedScopes',
  'VKWebAppCheckBannerAd',
  'VKWebAppHideBannerAd',
  'VKWebAppShowBannerAd',
  'VKWebAppCheckNativeAds',
  'VKWebAppShowNativeAds',
  'VKWebAppRetargetingPixel',
  'VKWebAppConversionHit',
  'VKWebAppShowSubscriptionBox',
  'VKWebAppCheckSurvey',
  'VKWebAppShowSurvey',
  'VKWebAppScrollTop',
  'VKWebAppScrollTopStart',
  'VKWebAppScrollTopStop',
  'VKWebAppShowSlidesSheet',
  'VKWebAppTranslate',
  'VKWebAppRecommend',

  // Desktop web specific events
  ...(IS_DESKTOP_VK
    ? [
        'VKWebAppResizeWindow',
        'VKWebAppAddToMenu',
        'VKWebAppShowInstallPushBox',
        'VKWebAppGetFriends',
        'VKWebAppShowCommunityWidgetPreviewBox',
        'VKWebAppCallStart',
        'VKWebAppCallJoin',
        'VKWebAppCallGetStatus',
      ]
    : ['VKWebAppShowImages']),
];

/** Android VK Bridge interface. */
const androidBridge: Record<AnyRequestMethodName, (serializedData: string) => void> | undefined =
  IS_CLIENT_SIDE ? (window as any).AndroidBridge : undefined;

/** iOS VK Bridge interface. */
const iosBridge: Record<AnyRequestMethodName, { postMessage?: (data: any) => void }> | undefined =
  IS_IOS_WEBVIEW ? (window as any).webkit.messageHandlers : undefined;

/** Web VK Bridge interface. */
const webBridge: { postMessage?: (message: any, targetOrigin: string) => void } | undefined = IS_WEB
  ? parent
  : undefined;

// [Примечание 1] Отключили использование в этом PR https://github.com/VKCOM/vk-bridge/pull/262
// let webSdkHandlers: string[] | undefined;

/**
 * Creates a VK Bridge API that holds functions for interact with runtime
 * environment.
 *
 * @param version Version of the package
 */
export function createVKBridge(version: string): VKBridge {
  /** Current frame id. */
  let webFrameId: string | undefined = undefined;

  /** List of functions that subscribed on events. */
  const subscribers: VKBridgeSubscribeHandler[] = [];

  /**
   * Sends an event to the runtime env. In the case of Android/iOS application
   * env is the application itself. In the case of the browser, the parent
   * frame in which the event handlers is located.
   *
   * @param method The method (event) name to send
   * @param [props] Method properties
   */
  function send<K extends AnyRequestMethodName>(
    method: K,
    props?: RequestProps<K> & RequestIdProp,
  ) {
    // Sending data through Android bridge

    if (androidBridge && androidBridge[method]) {
      androidBridge[method](JSON.stringify(props));
    }

    // Sending data through iOS bridge
    else if (
      iosBridge &&
      iosBridge[method] &&
      typeof iosBridge[method].postMessage === 'function'
    ) {
      iosBridge[method].postMessage!(props);
    }

    // Sending data through React Native bridge
    else if (IS_REACT_NATIVE_WEBVIEW) {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({
          handler: method,
          params: props,
        }),
      );
    }

    // Sending data through web bridge
    else if (webBridge && typeof webBridge.postMessage === 'function') {
      webBridge.postMessage(
        {
          handler: method,
          params: props,
          type: 'vk-connect',
          webFrameId,
          connectVersion: version,
        },
        '*',
      );
    }
  }

  /**
   * Adds an event listener. It will be called any time a data is received.
   *
   * @param listener A callback to be invoked on every event receive.
   */
  function subscribe(listener: VKBridgeSubscribeHandler) {
    subscribers.push(listener);
  }

  /**
   * Removes an event listener which has been subscribed for event listening.
   *
   * @param listener A callback to unsubscribe.
   */
  function unsubscribe(listener: VKBridgeSubscribeHandler) {
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
  function supports<K extends AnyRequestMethodName>(method: K): boolean {
    if (IS_ANDROID_WEBVIEW) {
      // Android support check
      return !!(androidBridge && typeof androidBridge[method] === 'function');
    } else if (IS_IOS_WEBVIEW) {
      // iOS support check
      return !!(
        iosBridge &&
        iosBridge[method] &&
        typeof iosBridge[method].postMessage === 'function'
      );
    } else if (IS_WEB) {
      // Web support check
      return DESKTOP_METHODS.includes(method);
      // см. Примечание 1
      // if (!webSdkHandlers) {
      //   console.error('You should call bridge.send("VKWebAppInit") first');
      //   return false;
      // }
      // return webSdkHandlers.includes(method);
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

  /**
   * Checks whether the runtime is an iframe.
   *
   * @returns Result of checking.
   */
  function isIframe(): boolean {
    return IS_WEB && window.parent !== window;
  }

  /**
   * Checks whether the runtime is embedded.
   *
   * @returns Result of checking.
   */
  function isEmbedded(): boolean {
    return isWebView() || isIframe();
  }

  /**
   * Checks whether the runtime is standalone.
   *
   * @returns Result of checking.
   */
  function isStandalone(): boolean {
    return !isEmbedded();
  }

  function handleEvent(event: any) {
    if (IS_IOS_WEBVIEW || IS_ANDROID_WEBVIEW) {
      // If it's webview
      return [...subscribers].map((fn) => fn.call(null, event));
    }

    let bridgeEventData = event?.data;
    if (!IS_WEB || !bridgeEventData) {
      return;
    }

    if (IS_REACT_NATIVE_WEBVIEW && typeof bridgeEventData === 'string') {
      try {
        bridgeEventData = JSON.parse(bridgeEventData);
      } catch {}
    }

    const { type, data, frameId } = bridgeEventData;
    if (!type) {
      return;
    }

    // см. Примечание 1
    // if (type === 'SetSupportedHandlers') {
    //   webSdkHandlers = data.supportedHandlers;
    //   return;
    // }

    if (type === 'VKWebAppSettings') {
      webFrameId = frameId;
      return;
    }

    [...subscribers].map((fn) => fn({ detail: { type, data } }));
  }

  // Subscribes to listening messages from a runtime for calling each
  // subscribed event listener.
  if (IS_REACT_NATIVE_WEBVIEW && /(android)/i.test(navigator.userAgent)) {
    document.addEventListener(EVENT_TYPE, handleEvent);
  } else if (typeof window !== 'undefined' && 'addEventListener' in window) {
    window.addEventListener(EVENT_TYPE, handleEvent);
  }

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
    isWebView,
    isIframe,
    isEmbedded,
    isStandalone,
  };
}
