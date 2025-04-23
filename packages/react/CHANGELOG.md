## v1.1.0

- Поддержка React 19 в `peerDependencies`.
- Добавлена новая асинхронная функция `runTapticImpactOccurredAsync` для корректной проверки поддержки вибрации.
- Функция `runTapticImpactOccurred` помечена как `@deprecated` и будет удалена в будущих версиях. Рекомендуется перейти на `runTapticImpactOccurredAsync`.
