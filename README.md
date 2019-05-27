<div align="center">
  <a href="https://github.com/VKCOM">
    <img width="100" height="100" src="https://avatars3.githubusercontent.com/u/1478241?s=200&v=4">
  </a>
  <br>
  <br>

  [![npm][npm]][npm-url]
  [![deps][deps]][deps-url]

</div>

# vkui-connect

Пакет для интеграции VKUI приложений с официальными клиентами VK для iOS, Android и Web.

## Подключение
```js
import connect from '@vkontakte/vkui-connect';
```

## Инициализация и подписка на события
```js
// Отправляет событие клиенту
connect.send('VKWebAppInit');

// Подписывается на события, отправленные клиентом
connect.subscribe((e) => console.log(e));
```

[npm]: https://img.shields.io/npm/v/@vkontakte/vkui-connect.svg
[npm-url]: https://npmjs.com/package/@vkontakte/vkui-connect

[deps]: https://img.shields.io/david/vkcom/vkui-connect.svg
[deps-url]: https://david-dm.org/vkcom/vkui-connect
