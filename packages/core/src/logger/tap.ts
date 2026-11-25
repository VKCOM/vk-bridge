import type { LogEntry, TapHandle, VKBridgeSendLike } from './types.ts';

/** Minimal shape of the bridge needed by the tap. */
interface TapBridge {
  send: VKBridgeSendLike;
  subscribe: (listener: (event: any) => void) => void;
  unsubscribe?: (listener: (event: any) => void) => void;
  __setOnSend?: (fn?: (method: any, props: any) => void) => void;
}

/** Extracts request_id from an incoming event's data, if present. */
function extractRequestId(data: unknown): string | number | undefined {
  if (data && typeof data === 'object' && 'request_id' in (data as any)) {
    const rid = (data as any).request_id;
    return rid != null ? rid : undefined;
  }
  return undefined;
}

/**
 * Installs a synchronous, dependency-free tap on the bridge: registers an
 * `onSend` hook (outgoing, with the real `request_id` assigned by
 * `promisifySend`) and subscribes a listener (incoming), buffering entries
 * into `pending`. Used to capture messages during the async gap before the
 * logger module (with the panel) finishes loading.
 *
 * Returns a handle that {@link removeTap} / `attachLogger` use to uninstall
 * the tap and drain the buffer.
 */
export function createTap(bridge: TapBridge): TapHandle {
  const pending: LogEntry[] = [];

  const onSend = (method: any, props: any): void => {
    pending.push({
      id: 0,
      dir: 'out',
      method: String(method ?? ''),
      data: props,
      ts: Date.now(),
      requestId: props?.request_id,
    });
  };

  const incomingListener = (event: any): void => {
    const data = event?.detail?.data;
    pending.push({
      id: 0,
      dir: 'in',
      method: String(event?.detail?.type ?? ''),
      data,
      ts: Date.now(),
      requestId: extractRequestId(data),
    });
  };

  bridge.__setOnSend?.(onSend);
  bridge.subscribe(incomingListener);

  return {
    pending,
    origSend: bridge.send.bind(bridge) as VKBridgeSendLike,
    incomingListener,
    onSend,
  };
}

/**
 * Removes a previously installed tap: clears the `onSend` hook and
 * unsubscribes the incoming listener.
 */
export function removeTap(bridge: TapBridge, handle: TapHandle): void {
  bridge.__setOnSend?.(undefined);
  bridge.unsubscribe?.(handle.incomingListener);
}
