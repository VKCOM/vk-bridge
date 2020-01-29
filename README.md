<div align="center">
  <a href="https://github.com/VKCOM">
    <img width="100" height="100" src="https://avatars3.githubusercontent.com/u/1478241?s=200&v=4">
  </a>
  <br>
  <br>

[![npm][npm]][npm-url]

[npm]: https://img.shields.io/npm/v/@vkontakte/vk-connect.svg
[npm-url]: https://npmjs.com/package/@vkontakte/vk-connect

</div>

# VK Connect

A package for integrating VK Mini Apps with official VK clients for iOS, Android and Web.

## Usage

```js
import connect from '@vkontakte/vk-connect';

// Sends event to client
connect.send('VKWebAppInit');

// Subscribes to event, sended by client
connect.subscribe(e => console.log(e));
```

For use in a browser, include the file [`dist/index.umd.js`](https://unpkg.com/@vkontakte/vk-connect/dist/index.umd.js) and use as follows

```html
<script src="dist/index.umd.js"></script>

<script>
  // Sends event to client
  vkConnect.send('VKWebAppInit');
</script>
```

## API Reference

### `connect.send(method[, params])`

Sends a message to native client and returns the `Promise` object with response data

**Parameters**

- `method` _required_ The VK Connect method
- `params` _optional_ Message data object

**Example**

```js
// Sending event to client
connect
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
  const data = await connect.send('VKWebAppGetEmail');

  // Handling received data
  console.log(data.email);
} catch (error) {
  // Handling an error
}
```

### `connect.subscribe(fn)`

Subscribes a function to events listening

**Parameters**

- `fn` _required_ Function to be subscribed to events

**Example**

```js
// Subscribing to receiving events
connect.subscribe(event => {
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
connect.send('VKWebAppOpenCodeReader', {});
```

### `connect.unsubscribe(fn)`

Unsubscribes a function from events listening

**Parameters**

- `fn` _required_ Event subscribed function

**Example**

```js
const fn = event => {
  // ...
};

// Subscribing
connect.subscribe(fn);

// Unsubscribing
connect.unsubscribe(fn);
```

### `connect.supports(method)`

Checks if an event is available on the current device

**Parameters**

- `method` _required_ The VK Connect method

### `connect.isWebView()`

Returns `true` if VK Connect is running in mobile app, or `false` if not

## Middleware API

_Middlewares_ are pieces of code that intercept and process data between sending and receiving. Thus, by creating middlewares, you can easily log data, modify data before sending it, talking to an asynchronous API, etc. If you've used Redux, you were also probably already familiar with the concept—a similar is used here.

### `applyMiddleware(middleware1, ..., middlewareN)`

Creates the VK Connect enhancer that applies middleware to the `send`
method. This is handy for a variety of task such as logging every sent
event. Returns the VK Connect enhancer applying the middleware.

**Parameters**

- `middlewareN` A middleware to be applied

**Example**

```js
import connect, { applyMiddleware } from '@vkontakte/vk-connect';

// Logs the result of each sent event
const logger = ({ send, subscribe }) => next => async (method, props) => {
  const result = await next(method, props);
  console.log(result);
  return result;
};

const enhancedConnect = applyMiddleware(logger)(connect);
```
