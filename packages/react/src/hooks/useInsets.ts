import { useState } from 'react';
import vkBridge from '@vkontakte/vk-bridge';
import type { VKBridgeEvent, AnyReceiveMethodName, Insets } from '@vkontakte/vk-bridge';
import { useIsomorphicLayoutEffect } from '../lib/react';

const VIRTUAL_KEYBOARD_HEIGHT = 150;

const BOTTOM_INSET_FOR_VIRTUAL_KEYBOARD = 0;

export interface UseInsets {
  top: Insets['top'] | null;
  right: Insets['right'] | null;
  bottom: Insets['bottom'] | null;
  left: Insets['left'] | null;
}

let initialState: UseInsets = {
  bottom: null,
  top: null,
  left: null,
  right: null,
};

export const useInsets = (): UseInsets => {
  const [insets, setInsets] = useState<UseInsets>(initialState);

  useIsomorphicLayoutEffect(() => {
    const handleBridgeEvent = (event: VKBridgeEvent<AnyReceiveMethodName>) => {
      const insets = resolveInsets(event);
      if (insets) {
        setInsets(insets);
      }
    };

    vkBridge.subscribe(handleBridgeEvent);
    return () => {
      vkBridge.unsubscribe(handleBridgeEvent);
    };
  }, []);

  return insets;
};

function resolveInsets(event: VKBridgeEvent<AnyReceiveMethodName>): UseInsets | null {
  const { type, data } = event.detail;
  switch (type) {
    case 'VKWebAppUpdateInsets': // TODO [>=3]: it is legacy, remove it
    case 'VKWebAppUpdateConfig':
      if (!('insets' in data)) {
        return null;
      }
      const { insets } = data;
      if (insets) {
        return {
          ...insets,
          bottom:
            insets.bottom > VIRTUAL_KEYBOARD_HEIGHT
              ? BOTTOM_INSET_FOR_VIRTUAL_KEYBOARD
              : insets.bottom,
        };
      }
  }
  return null;
}
