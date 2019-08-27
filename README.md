<div align="center">
  <a href="https://github.com/VKCOM">
    <img width="100" height="100" src="https://avatars3.githubusercontent.com/u/1478241?s=200&v=4">
  </a>
  <br>
  <br>

[![npm][npm]][npm-url]
[![deps][deps]][deps-url]

</div>

# VK Connect

A package for integrating VK applications with official VK clients for iOS, Android and Web.

## Usage

```js
import connect from '@vkontakte/vk-connect';

// Sends event to client
connect.send('VKWebAppInit');

// Subscribes to event, sended by client
connect.subscribe(e => console.log(e));
```

For use in a browser, include the file [`dist/index.umd.js`](dist/index.umd.js) and use as follows

```html
<script src="dist/index.umd.js"></script>

<script>
  // Sends event to client
  vkConnect.send('VKWebAppInit');
</script>
```

[npm]: https://img.shields.io/npm/v/@vkontakte/vk-connect.svg
[npm-url]: https://npmjs.com/package/@vkontakte/vk-connect
[deps]: https://img.shields.io/david/vkcom/vk-connect.svg
[deps-url]: https://david-dm.org/vkcom/vk-connect
