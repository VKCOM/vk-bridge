import { useState } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import type {
  VKBridgeEvent,
  AnyReceiveMethodName,
  AdaptivityType,
  SharedUpdateConfigData,
  ParentConfigData,
} from '@vkontakte/vk-bridge';
import { useIsomorphicLayoutEffect } from '../lib/react';

export interface UseAdaptivity {
  type: null | AdaptivityType;
  viewportWidth: number;
  viewportHeight: number;
}

const initialState: UseAdaptivity = {
  type: null,
  viewportWidth: 0,
  viewportHeight: 0,
};

export const useAdaptivity = (): UseAdaptivity => {
  const [bridgeAdaptivity, setBridgeAdaptivity] = useState<UseAdaptivity>(initialState);

  useIsomorphicLayoutEffect(() => {
    const updateAdaptivity = (data: ParentConfigData) => {
      if (!('viewport_width' in data) || !('viewport_height' in data)) {
        return;
      }

      const newAdaptivity = resolveAdaptivity(data);

      if (newAdaptivity) {
        setBridgeAdaptivity(newAdaptivity);
      }
    };

    const handleBridgeEvent = (event: VKBridgeEvent<AnyReceiveMethodName>) => {
      const { type, data } = event.detail;

      if (type !== 'VKWebAppUpdateConfig') {
        return;
      }

      updateAdaptivity(data);
    };

    vkBridge.subscribe(handleBridgeEvent);
    vkBridge.send('VKWebAppGetConfig').then(updateAdaptivity).catch(console.error);

    return () => {
      vkBridge.unsubscribe(handleBridgeEvent);
    };
  }, []);

  return bridgeAdaptivity;
};

function resolveAdaptivity(data: SharedUpdateConfigData): UseAdaptivity | null {
  const { adaptivity, viewport_width, viewport_height } = data;

  const bridgeAdaptivity: UseAdaptivity = {
    type: null,
    viewportWidth: isFinite(viewport_width) ? Number(viewport_width) : 0,
    viewportHeight: isFinite(viewport_height) ? Number(viewport_height) : 0,
  };

  switch (adaptivity) {
    case 'force_mobile':
    case 'force_mobile_compact':
    case 'adaptive':
      bridgeAdaptivity.type = adaptivity;
  }

  return bridgeAdaptivity;
}
