import type { VKBridge } from '../types/bridge.ts';
import { isLogEnabled } from './detect.ts';
import { createTap } from './tap.ts';

/**
 * Auto-attaches the logger when the activation flag is set, using a dynamic
 * import for the heavy logger module (panel UI) so it stays out of the main
 * bundle when logging is disabled.
 *
 * A synchronous tap is installed immediately to buffer messages during the
 * async gap before the logger module finishes loading; the logger drains and
 * replaces it on attach.
 */
export function autoAttachLogger(bridge: VKBridge): void {
  if (!isLogEnabled() || typeof window === 'undefined') {
    return;
  }
  const tap = createTap(bridge);
  import('./index.ts')
    .then((m) => m.attachLogger(bridge, tap))
    .catch(() => {
      // If the logger chunk fails to load, restore the original send so the
      // bridge keeps working, even though messages are no longer buffered.
      bridge.send = tap.origSend;
      bridge.unsubscribe(tap.incomingListener);
    });
}
