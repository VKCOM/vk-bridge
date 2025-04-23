import vkBridge from '@vkontakte/vk-bridge';
import type { TapticVibrationPowerType } from '@vkontakte/vk-bridge';

/**
 * Dispatch device vibration if supported.
 *
 * @param style - The strength of the vibration feedback.
 * @returns A Promise that resolves to `true` if the vibration was triggered, or `false` if not supported.
 */
export async function runTapticImpactOccurredAsync(
  style: TapticVibrationPowerType,
): Promise<boolean> {
  const supported = await vkBridge.supportsAsync('VKWebAppTapticImpactOccurred');

  if (supported) {
    vkBridge.send('VKWebAppTapticImpactOccurred', { style }).catch(() => undefined);
    return true;
  }
  return false;
}

/**
 * @deprecated Use {@link runTapticImpactOccurredAsync} instead.
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
