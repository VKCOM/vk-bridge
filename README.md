# vkui-connect

Пакет для интеграции VKUI-приложений с нативными клиентами VK для iOS и Android.

```js
const connect = require('vkui-connect');

// Отправляет событие нативному клиенту
connect.send('VKWebAppInit');

// Подписывается на события, отправленные нативным клиентом
connect.subscribe((e) => console.log(e));
```