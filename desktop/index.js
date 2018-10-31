(function(window) {
    var VKConnect = require('..');

    window.addEventListener('message', function() {
      var args = Array.prototype.slice.call(arguments);
      var event = new CustomEvent('VKWebAppEvent', {
        detail: args[0].data
      });
      window.dispatchEvent(event)
    });
    module.exports = {
      send: function send(handler, params) {
        if (!params) {
          params = {};
        }
        parent.postMessage({
          handler,
          params,
          type: 'vk-connect'
        }, '*');
      },
      subscribe: VKConnect.subscribe,
      unsubscribe: VKConnect.unsubscribe,
      supports: VKConnect.supports
    }
})(window);