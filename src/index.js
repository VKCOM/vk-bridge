function isFunction(object) {
  return typeof object === 'function';
}

const isClient = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
const androidBridge = isClient && window.AndroidBridge;
const iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
const isWeb = isClient && !androidBridge && !iosBridge;

const connectVersion = process.env.PACKAGE_VERSION;
const eventType = isWeb ? 'message' : 'VKWebAppEvent';

const subscribers = [];
let webFrameId = null;

if (isClient) {
  window.addEventListener(eventType, (...args) => {
    const currentSubscribers = subscribers.slice();
    const payload = args[0];

    if (isWeb) {
      delete payload.data.webFrameId;
      delete payload.data.connectVersion;

      if (payload.data.type && payload.data.type === 'VKWebAppSettings') {
        webFrameId = payload.data.frameId;
      } else {
        currentSubscribers.forEach((fn) => {
          fn({
            detail: payload.data
          });
        });
      }
    } else {
      currentSubscribers.forEach((fn) => {
        fn.apply(null, args);
      });
    }
  });
}

// CustomEvent polyfill
if (isClient && !window.CustomEvent) {
  (function() {
    function CustomEvent(event, params) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      var evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
      return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
  })();
}

/**
 * Sends a message to native client
 *
 * @example
 * message.send('VKWebAppInit');
 *
 * @param {String} handler Message type
 * @param {Object} params Message data
 * @returns {void}
 */
function send(handler, params = {}) {
  if (androidBridge && isFunction(androidBridge[handler])) {
    return androidBridge[handler](JSON.stringify(params));
  }

  if (iosBridge && iosBridge[handler] && isFunction(iosBridge[handler].postMessage)) {
    return iosBridge[handler].postMessage(params);
  }

  if (isWeb) {
    parent.postMessage({
      handler,
      params,
      type: 'vk-connect',
      webFrameId: webFrameId,
      connectVersion
    }, '*');
  }
}

/**
 * Subscribe on VKWebAppEvent
 *
 * @param {Function} fn Event handler
 * @returns {void}
 */
function subscribe(fn) {
  subscribers.push(fn);
}

/**
 * Unsubscribe from VKWebAppEvent
 *
 * @param {Function} fn Event handler
 * @returns {void}
 */
function unsubscribe(fn) {
  const index = subscribers.indexOf(fn);

  if (index > -1) {
    subscribers.splice(index, 1);
  }
}

/**
 * Checks if native client supports handler
 *
 * @param {String} handler Method name
 * @returns {boolean}
 */
function supports(handler) {
  if (!isClient) return false;

  if (androidBridge && isFunction(androidBridge[handler])) return true;
  if (iosBridge && iosBridge[handler] && isFunction(iosBridge[handler].postMessage)) return true;

  const desktopEvents = [
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
    'VKWebAppResizeWindow'
  ];

  if (isWeb && ~desktopEvents.indexOf(handler)) return true;

  return false;
}

const VKUIConnect = {
  send,
  subscribe,
  unsubscribe,
  supports
};

export default VKUIConnect;
