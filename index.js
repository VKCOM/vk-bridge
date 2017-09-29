const isFunc = (f) => typeof f === 'function';
const isClient = () => typeof window !== 'undefined';

let subscribers = [];

if (isClient()) {
  window.addEventListener('VKWebAppEvent', function(...args) {
    subscribers.forEach(function(fn) {
      fn.apply(null, args);
    });
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
  send(handler, params = {}) {
    const androidBridge = isClient() && window.AndroidBridge;
    const iosBridge = isClient() && window.webkit && window.webkit.messageHandlers;

    if (androidBridge && isFunction(androidBridge[handler])) {
      androidBridge[handler](JSON.stringify(params));
    }
    if (iosBridge && iosBridge[handler] && isFunction(iosBridge[handler].postMessage)) {
      iosBridge[handler].postMessage(params);
    }
  },
  /**
   * Subscribe on VKWebAppEvent
   *
   * @param {Function} fn Event handler
   * @returns {void}
   */
  subscribe(fn) {
    subscribers.push(fn);
  }
};
