# VK Bridge React

React hooks for VK Bridge.

In addition, the library provides other helper functions.

## Usage

```sh
npm install @vkontakte/vk-bridge @vkontakte/vk-bridge-react
```

```tsx
import { useInsets, runTapticImpactOccurred } from '@vkontakte/vk-bridge-react';

// Sends event to client
const App = () => {
  const insets = useInsets();

  const handleClick = () => {
    runTapticImpactOccurred();
  };

  return (
    <div style={{ paddingTop: insets?.top }}>
      <button onClick={handleClick}>Touch me and feel</button>
    </div>
  );
};
```

## Hooks

<table>

<tr>
  <td> <b>Name</b> </td>
  <td> <b>Return type</b> </td>
  <td> <b>Description</b> </td>
</tr>

<tr>
  <td> <code>useAppearance()</code> </td>
  <td>

<!-- prettier-ignore -->
  ```ts
  type UseAppearance = AppearanceType | null;
  ```

  </td>
  <td>

<!-- prettier-ignore -->
  Hook listens to update the `appearance` property of the `VKWebAppUpdateConfig` event. It dispatches the `VKWebAppGetConfig` event on first initialization.

<!-- prettier-ignore -->
  > **Note:** hook works only for `vkBridge.isEmbedded()` mode.

  </td>
</tr>

<tr>
  <td> <code>useAdaptivity()</code> </td>
  <td>

<!-- prettier-ignore -->
  ```ts
  interface UseAdaptivity {
    type: null | AdaptivityType;
    viewportWidth: number;
    viewportHeight: number;
  }
  ```

  </td>
  <td> Hook listens to update the <code>adaptivity</code> property of the <code>VKWebAppUpdateConfig</code> event. </td>
</tr>

<tr>
  <td> <code>useInsets()</code> </td>
  <td>

<!-- prettier-ignore -->
  ```ts
  type UseInsets = {
    top: number;
    right: number;
    bottom: number;
    left: number;
  } | null;
  ```

  </td>
  <td>

<!-- prettier-ignore -->
  Hook listens to update the `insets` property of the `VKWebAppUpdateConfig` event.

<!-- prettier-ignore -->
  > **Note:** when the virtual keyboard is visible, _inset_ of _bottom_ corresponds to **0**.

  </td>
</tr>

</table>

## Helpers

<table>

<tr>
  <td> <b>Name</b> </td>
  <td> <b>Return type</b> </td>
  <td> <b>Description</b> </td>
</tr>

<tr>
  <td> <code>runTapticImpactOccurred</code> </td>
  <td> <code>boolean</code> </td>
  <td> Function dispatches <code>VKWebAppTapticImpactOccurred</code> event if it is support (will return <code>true</code>). </td>
</tr>

</table>
