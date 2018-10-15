(function(window) {
  var FUNCTION = 'function';
  var UNDEFINED = 'undefined';
  var subscribers = [];
  var isWeb = typeof window !== UNDEFINED && !window.AndroidBridge && !window.webkit;
  var eventType = isWeb ? 'message' : 'VKWebAppEvent';

  if (typeof window !== UNDEFINED) {

    //polyfill
    if (!window.CustomEvent) {
      (function() {
        function CustomEvent(event, params) {
          params = params || {bubbles: false, cancelable: false, detail: undefined};
          var evt = document.createEvent('CustomEvent');
          evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
          return evt;
        };

        CustomEvent.prototype = window.Event.prototype;

        window.CustomEvent = CustomEvent;
      })();
    }

    window.addEventListener(eventType, function() {
      var args = Array.prototype.slice.call(arguments);
      if (isWeb) {
        subscribers.forEach(function(fn) {
          fn({
            detail: args[0].data
          });
        });
      } else {
        subscribers.forEach(function(fn) {
          fn.apply(null, args);
        });
      }
    });
  }

  module.exports = {
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

      var isClient = typeof window !== UNDEFINED;
      var androidBridge = isClient && window.AndroidBridge;
      var iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
      var isDesktop = !androidBridge && !iosBridge;

      if (androidBridge && typeof androidBridge[handler] == FUNCTION) {
        androidBridge[handler](JSON.stringify(params));
      }
      if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage == FUNCTION) {
        iosBridge[handler].postMessage(params);
      }

      if (isDesktop) {
        parent.postMessage({
          handler: handler,
          params: params,
          type: 'vk-connect'
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
     * Checks if native client supports nandler
     *
     * @param {String} handler Handler name
     * @returns {boolean}
     */
    supports: function supports(handler) {

      var isClient = typeof window !== UNDEFINED;
      var androidBridge = isClient && window.AndroidBridge;
      var iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
      var desktopEvents = [
        "VKWebAppGetAuthToken",
        "VKWebAppCallAPIMethod",
        "VKWebAppGetGeodata",
        "VKWebAppGetUserInfo",
        "VKWebAppGetPhoneNumber",
        "VKWebAppGetClientVersion",
        "VKWebAppOpenPayForm",
        "VKWebAppShare",
        "VKWebAppAllowNotifications",
        "VKWebAppDenyNotifications",
        "VKWebAppShowWallPostBox",
        "VKWebAppGetEmail",
        "VKWebAppAllowMessagesFromGroup",
        "VKWebAppJoinGroup",
        "VKWebAppOpenApp",
        "VKWebAppSetLocation",
        "VKWebAppScroll",
        "VKWebAppResizeWindow",
      ];

      if (androidBridge && typeof androidBridge[handler] == FUNCTION) return true;

      if (iosBridge && iosBridge[handler] && typeof iosBridge[handler].postMessage == FUNCTION) return true;

      if (!iosBridge && !androidBridge && ~desktopEvents.indexOf(handler)) return true;

      return false;
    }
  };
})(window);
