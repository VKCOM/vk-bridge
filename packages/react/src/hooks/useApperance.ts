import { useState } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import type {
  AnyReceiveMethodName,
  VKBridgeEvent,
  AppearanceType,
  ParentConfigData,
} from '@vkontakte/vk-bridge';
import { useIsomorphicLayoutEffect } from '../lib/react';

export type UseAppearance = AppearanceType | null;

/**
 * Note: it works only for "embedded" app mode.
 */
export const useAppearance = (): UseAppearance => {
  const [appearance, setAppearance] = useState<UseAppearance>(null);

  useIsomorphicLayoutEffect(() => {
    if (!vkBridge.isEmbedded()) {
      return;
    }

    const updateAppearance = (data: ParentConfigData) => {
      const initialAppearance = resolveAppearance(data);

      if (initialAppearance) {
        setAppearance(initialAppearance);
      }
    };

    const handleBridgeEvent = (event: VKBridgeEvent<AnyReceiveMethodName>) => {
      const { type, data } = event.detail;

      if (type !== 'VKWebAppUpdateConfig' || !('appearance' in data) || !('scheme' in data)) {
        return;
      }

      updateAppearance(data);
    };

    vkBridge.subscribe(handleBridgeEvent);
    vkBridge.send('VKWebAppGetConfig').then(updateAppearance).catch(console.error);

    return () => vkBridge.unsubscribe(handleBridgeEvent);
  }, []);

  return appearance;
};

function resolveAppearance({ scheme, appearance }: ParentConfigData): UseAppearance {
  if (appearance) {
    return appearance;
  }

  return scheme === 'space_gray' || scheme === 'vkcom_dark' ? 'dark' : 'light';
}
