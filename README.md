[npm-badge]: https://img.shields.io/npm/v/@vkontakte/vk-bridge.svg
[npm-link]: https://npmjs.com/package/@vkontakte/vk-bridge

[<img width="134" src="https://vk.com/images/apps/mini_apps/vk_mini_apps_logo.svg">](https://vk.com/services)

# VK Bridge [![NPM][npm-badge]][npm-link]

A package for integrating VK Mini Apps with official VK clients for iOS, Android and Web.

## Usage

```js
import bridge from '@vkontakte/vk-bridge';

// Sends event to client
bridge.send('VKWebAppInit');

// Subscribes to event, sended by client
bridge.subscribe(e => console.log(e));
```

For use in a browser, include the file [`dist/browser.min.js`](https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js) and use as follows

```html
<script src="https://unpkg.com/@vkontakte/vk-bridge/dist/browser.min.js"></script>

<script>
  // Sends event to client
  vkBridge.send('VKWebAppInit');
</script>
```

## API Reference

### `bridge.send(method[, params])`

Sends a message to native client and returns the `Promise` object with response data

**Parameters**

- `method` _required_ The VK Bridge method
- `params` _optional_ Message data object

**Example**

```js
// Sending event to client
bridge
  .send('VKWebAppGetEmail')
  .then(data => {
    // Handling received data
    console.log(data.email);
  })
  .catch(error => {
    // Handling an error
  });
```

You can also use imperative way

```js
try {
  const data = await bridge.send('VKWebAppGetEmail');

  // Handling received data
  console.log(data.email);
} catch (error) {
  // Handling an error
}
```

### `bridge.subscribe(fn)`

Subscribes a function to events listening

**Parameters**

- `fn` _required_ Function to be subscribed to events

**Example**

```js
// Subscribing to receiving events
bridge.subscribe(event => {
  if (!event.detail) {
    return;
  }

  const { type, data } = event.detail;

  if (type === 'VKWebAppOpenCodeReaderResult') {
    // Reading result of the Code Reader
    console.log(data.code_data);
  }

  if (type === 'VKWebAppOpenCodeReaderFailed') {
    // Catching the error
    console.log(data.error_type, data.error_data);
  }
});

// Sending method
bridge.send('VKWebAppOpenCodeReader', {});
```

### `bridge.unsubscribe(fn)`

Unsubscribes a function from events listening

**Parameters**

- `fn` _required_ Event subscribed function

**Example**

```js
const fn = event => {
  // ...
};

// Subscribing
bridge.subscribe(fn);

// Unsubscribing
bridge.unsubscribe(fn);
```

### `bridge.supports(method)`

Checks if an event is available on the current device

**Parameters**

- `method` _required_ The VK Bridge method

### `bridge.isWebView()`

Returns `true` if VK Bridge is running in mobile app, or `false` if not

## Middleware API

_Middlewares_ are pieces of code that intercept and process data between sending and receiving. Thus, by creating middlewares, you can easily log data, modify data before sending it, talking to an asynchronous API, etc. If you've used Redux, you were also probably already familiar with the concept—a similar is used here.

### `applyMiddleware(middleware1, ..., middlewareN)`

Creates the VK Bridge enhancer that applies middleware to the `send`
method. This is handy for a variety of task such as logging every sent
event. Returns the VK Bridge enhancer applying the middleware.

**Parameters**

- `middlewareN` A middleware to be applied

**Example**

```js
import bridge, { applyMiddleware } from '@vkontakte/vk-bridge';

// Logs the result of each sent event
const logger = ({ send, subscribe }) => next => async (method, props) => {
  const result = await next(method, props);
  console.log(result);
  return result;
};

const enhancedBridge = applyMiddleware(logger)(bridge);
```
