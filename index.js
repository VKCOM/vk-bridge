(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["VKUIConnect"] = factory();
	else
		root["VKUIConnect"] = factory();
})(typeof self !== 'undefined' ? self : this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
function isFunction(object) {
  return typeof object === 'function';
}

var isClient = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
var androidBridge = isClient && window.AndroidBridge;
var iosBridge = isClient && window.webkit && window.webkit.messageHandlers;
var isWeb = isClient && !androidBridge && !iosBridge;
var connectVersion = "1.2.0";
var eventType = isWeb ? 'message' : 'VKWebAppEvent';
var subscribers = [];
var webFrameId = null;

if (isClient) {
  window.addEventListener(eventType, function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var currentSubscribers = subscribers.slice();
    var payload = args[0];

    if (isWeb) {
      delete payload.data.webFrameId;
      delete payload.data.connectVersion;

      if (payload.data.type && payload.data.type === 'VKWebAppSettings') {
        webFrameId = payload.data.frameId;
      } else {
        currentSubscribers.forEach(function (fn) {
          fn({
            detail: payload.data
          });
        });
      }
    } else {
      currentSubscribers.forEach(function (fn) {
        fn.apply(null, args);
      });
    }
  });
} // CustomEvent polyfill


if (isClient && !window.CustomEvent) {
  (function () {
    function CustomEvent(event, params) {
      params = params || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
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


function send(handler) {
  var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  if (androidBridge && isFunction(androidBridge[handler])) {
    return androidBridge[handler](JSON.stringify(params));
  }

  if (iosBridge && iosBridge[handler] && isFunction(iosBridge[handler].postMessage)) {
    return iosBridge[handler].postMessage(params);
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
  var index = subscribers.indexOf(fn);

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
  var desktopEvents = ['VKWebAppInit', 'VKWebAppGetCommunityAuthToken', 'VKWebAppAddToCommunity', 'VKWebAppGetUserInfo', 'VKWebAppSetLocation', 'VKWebAppGetClientVersion', 'VKWebAppGetPhoneNumber', 'VKWebAppGetEmail', 'VKWebAppGetGeodata', 'VKWebAppSetTitle', 'VKWebAppGetAuthToken', 'VKWebAppCallAPIMethod', 'VKWebAppJoinGroup', 'VKWebAppAllowMessagesFromGroup', 'VKWebAppDenyNotifications', 'VKWebAppAllowNotifications', 'VKWebAppOpenPayForm', 'VKWebAppOpenApp', 'VKWebAppShare', 'VKWebAppShowWallPostBox', 'VKWebAppScroll', 'VKWebAppResizeWindow'];
  if (isWeb && ~desktopEvents.indexOf(handler)) return true;
  return false;
}

var VKUIConnect = {
  send: send,
  subscribe: subscribe,
  unsubscribe: unsubscribe,
  supports: supports
};
/* harmony default export */ __webpack_exports__["default"] = (VKUIConnect);

/***/ })
/******/ ])["default"];
});
//# sourceMappingURL=index.js.map