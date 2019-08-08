(function() {
  function isFunction(object) {
    return typeof object === 'function';
  }

  var subscribers = [];
  var webFrameId = null;
  var connectVersion = '1.5.4';

  var isClient = typeof window !== 'undefined';
  var isIOSNativeClient = isClient
      && window.webkit
      && window.webkit.messageHandlers !== undefined
      && window.webkit.messageHandlers.VKWebAppGetUserInfo !== undefined;

  var androidBridge = isClient && window.AndroidBridge;
  var iosBridge = isIOSNativeClient && window.webkit.messageHandlers;

  var isWeb = isClient && !androidBridge && !iosBridge;
  var eventType = isWeb ? 'message' : 'VKWebAppEvent';

  if (isClient) {
    // polyfill
    if (!window.CustomEvent) {
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

    window.addEventListener(eventType, function() {
      var args = Array.prototype.slice.call(arguments);
      var _subscribers = subscribers.slice();
      if (isWeb) {
        if (Object.prototype.hasOwnProperty.call(args[0].data, 'webFrameId')) {
          delete args[0].data.webFrameId;
        }
        if (Object.prototype.hasOwnProperty.call(args[0].data, 'connectVersion')) {
          delete args[0].data.connectVersion;
        }
        if (args[0].data.type && args[0].data.type === 'VKWebAppSettings') {
          webFrameId = args[0].data.frameId;
        } else {
          _subscribers.forEach(function(fn) {
            fn({
              detail: args[0].data
            });
          });
        }
      } else {
        _subscribers.forEach(function(fn) {
          fn.apply(null, args);
        });
      }
    });
  }

  var vkuiConnect = {
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
    send: function send(handler, params) {
      if (!params) {
        params = {};
      }

      if (androidBridge && isFunction(androidBridge[handler])) {
        androidBridge[handler](JSON.stringify(params));
      }
      if (iosBridge && iosBridge[handler] && isFunction(iosBridge[handler].postMessage)) {
        iosBridge[handler].postMessage(params);
      }

      if (isWeb) {
        parent.postMessage({
          handler: handler,
          params: params,
          type: 'vk-connect',
          webFrameId: webFrameId,
          connectVersion: connectVersion
        }, '*');
      }
    },
    /**
     * Subscribe on VKWebAppEvent
     *
     * @param {Function} fn Event handler
     * @returns {void}
     */
    subscribe: function subscribe(fn) {
      subscribers.push(fn);
    },
    /**
     * Unsubscribe on VKWebAppEvent
     *
     * @param {Function} fn Event handler
     * @returns {void}
     */
    unsubscribe: function unsubscribe(fn) {
      var index = subscribers.indexOf(fn);

      if (index > -1) {
        subscribers.splice(index, 1);
      }
    },

    /**
     * Checks if it is client webview
     *
     * @returns {boolean}
     */
    isWebView: function isWebView() {
      return !!(androidBridge || iosBridge);
    },

    /**
     * Checks if native client supports nandler
     *
     * @param {String} handler Handler name
     * @returns {boolean}
     */
    supports: function supports(handler) {
      var desktopEvents = [
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

      if (androidBridge && isFunction(androidBridge[handler])) return true;
      if (iosBridge && iosBridge[handler] && isFunction(iosBridge[handler].postMessage)) return true;
      if (!iosBridge && !androidBridge && ~desktopEvents.indexOf(handler)) return true;

      return false;
    }
  };

  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = vkuiConnect;
  } else {
    var root;
    if (typeof window !== 'undefined') {
      root = window;
    } else if (typeof global !== 'undefined') {
      root = global;
    } else if (typeof self !== 'undefined') {
      root = self;
    } else {
      root = this;
    }
    root.vkuiConnect = vkuiConnect;
  }
})();
