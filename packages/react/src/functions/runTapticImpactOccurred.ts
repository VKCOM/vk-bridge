import vkBridge from '@vkontakte/vk-bridge';
import type { TapticVibrationPowerType } from '@vkontakte/vk-bridge';

export function runTapticImpactOccurred(style: TapticVibrationPowerType) {
  if (vkBridge.supports('VKWebAppTapticImpactOccurred')) {
    vkBridge.send('VKWebAppTapticImpactOccurred', { style }).catch(() => undefined);
  }
}
