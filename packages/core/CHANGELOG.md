## v2.15.5

- Добавили недостающие поля `bdate_visibility`, `can_access_closed`, `is_closed` в ответ метода `VKWebAppGetUserInfo`

## v2.15.4

- Исправили лишние ворнинги в консоли при вызове `bridge.supportsAsync`

## v2.15.3

- Добавлены типы для метода `VKWebAppTrackEvent`

## v2.15.2

- Добавили недостающее поле `user_ids` в параметры метода `VKWebAppGetUserInfo`

## v2.15.1

- Добавлены новые параметры вызова метода `VKWebAppShowBannerAd`
- `height_type` - позволяет указать высоту баннера
- `orientation` - горизонталный / вертикальный баннер

## v2.15.0

- `bridge.supports` помечен как устаревший. Используйте вместо него `bridge.supportsAsync`.
