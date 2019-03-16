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
