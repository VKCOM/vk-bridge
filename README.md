<div align="center">
  <a href="https://github.com/VKCOM">
    <img width="100" height="100" src="https://avatars3.githubusercontent.com/u/1478241?s=200&v=4">
  </a>
  <br>
  <br>

[![npm][npm]][npm-url]
[![deps][deps]][deps-url]

[npm]: https://img.shields.io/npm/v/@vkontakte/vk-connect.svg
[npm-url]: https://npmjs.com/package/@vkontakte/vk-connect
[deps]: https://img.shields.io/david/vkcom/vk-connect.svg
[deps-url]: https://david-dm.org/vkcom/vk-connect

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

### `connect.sendPromise(method[, params])`

Sends a message to native client and returns the `Promise` object with response data

**Parameters**

- `method` _required_ The VK Connect method
- `params` _optional_ Message data object

**Example**

```js
// Sending event to client
connect
  .sendPromise('VKWebAppGetEmail')
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
  const data = await connect.sendPromise('VKWebAppGetEmail');

  // Handling received data
  console.log(data.email);
} catch (error) {
  // Handling an error
}
```

### `connect.send(method[, params])`

Sends a message to native client

**Parameters**

- `method` _required_ The VK Connect method
- `params` _optional_ Message data object

**Example**

```js
// App initialization
connect.send('VKWebAppInit');

// Opening images
connect.send('VKWebAppShowImages', {
  images: [
    "https://pp.userapi.com/c639229/v639229113/31b31/KLVUrSZwAM4.jpg",
    "https://pp.userapi.com/c639229/v639229113/31b94/mWQwkgDjav0.jpg",
    "https://pp.userapi.com/c639229/v639229113/31b3a/Lw2it6bdISc.jpg"
  ]
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
