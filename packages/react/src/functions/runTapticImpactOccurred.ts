import vkBridge from '@vkontakte/vk-bridge';
import type { TapticVibrationPowerType } from '@vkontakte/vk-bridge';

/**
 * Dispatch device vibration if supported.
 *
 * Return `false` if not supported.
 */
export function runTapticImpactOccurred(style: TapticVibrationPowerType) {
  if (vkBridge.supports('VKWebAppTapticImpactOccurred')) {
    vkBridge.send('VKWebAppTapticImpactOccurred', { style }).catch(() => undefined);
    return true;
  }
  return false;
}
