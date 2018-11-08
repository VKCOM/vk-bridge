# vkui-connect

Пакет для интеграции VKUI-приложений с нативными клиентами VK для iOS и Android.

# Без поддержки web, только iOS и Android 
```js
import * as connect from '@vkontakte/vkui-connect';
```

# С поддержкой веб клиентов
```js
import * as connect from '@vkontakte/vkui-connect/desktop';
```

# Инициализация и подписка на события
```js
// Отправляет событие нативному клиенту
connect.send('VKWebAppInit');

// Подписывается на события, отправленные нативным клиентом
connect.subscribe((e) => console.log(e));
```