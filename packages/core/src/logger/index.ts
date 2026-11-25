/// <reference lib="dom" />
import type { VKBridge } from '../types/bridge.ts';
import { isLogEnabled } from './detect.ts';
import { createTap, removeTap } from './tap.ts';
import { createLogStore } from './store.ts';
import { mountPanel, copyText } from './panel.ts';
import type { PanelHandle } from './panel.ts';
import type { LogEntry, TapHandle } from './types.ts';

/** Global API exposed for remote debugging from the console. */
export interface VkBridgeLogGlobal {
  /** Returns all entries. */
  list(): LogEntry[];
  /** Returns entries whose method or data matches the query. */
  filter(query: string): LogEntry[];
  /** Clears all entries. */
  clear(): void;
  /** Copies a single entry by id; returns the serialized entry. */
  copy(id: number): string | null;
  /** Serializes and copies all (optionally filtered) entries. */
  export(query?: string): string;
  /** Shows the overlay panel. */
  show(): void;
  /** Hides the overlay panel. */
  hide(): void;
}

declare global {
  interface Window {
    __vkBridgeLog?: VkBridgeLogGlobal;
  }
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
 * Attaches the logger to a bridge instance: drains the pending tap buffer,
 * registers an `onSend` hook (outgoing, with the real `request_id` assigned
 * by `promisifySend`) and a subscribe listener (incoming, with `request_id`
 * extracted from the event data), mounts the overlay panel, and exposes the
 * `window.__vkBridgeLog` global API.
 *
 * Returns the installed global API handle.
 */
export function attachLogger(bridge: VKBridge, tap: TapHandle): VkBridgeLogGlobal {
  // Remove the synchronous tap: clear its onSend hook and unsubscribe its
  // incoming listener.
  removeTap(bridge, tap);

  const store = createLogStore({ maxSize: 500 });

  // Drain entries buffered while the logger module was loading.
  for (const entry of tap.pending) {
    store.push({
      dir: entry.dir,
      method: entry.method,
      data: entry.data,
      ts: entry.ts,
      requestId: entry.requestId,
    });
  }

  // Outgoing: register an onSend hook. promisifySend invokes it synchronously
  // right before dispatch, with the final props (including request_id).
  (bridge as any).__setOnSend?.((method: any, props: any) => {
    store.push({
      dir: 'out',
      method: String(method ?? ''),
      data: props,
      ts: Date.now(),
      requestId: props?.request_id,
    });
  });

  // Incoming: subscribe a logging listener (same pattern as promisifySend).
  const incomingListener = (event: any) => {
    const data = event?.detail?.data;
    store.push({
      dir: 'in',
      method: String(event?.detail?.type ?? ''),
      data,
      ts: Date.now(),
      requestId: extractRequestId(data),
    });
  };
  bridge.subscribe(incomingListener);

  let panel: PanelHandle | null = null;
  try {
    panel = mountPanel(store, (method, props) => {
      // Replay the request with the same body. A rejection is expected for
      // failed methods — the Failed event still reaches the log via subscribe.
      Promise.resolve(bridge.send(method as any, props as any)).catch(() => {
        // ignore
      });
    });
  } catch {
    panel = null;
  }

  const api: VkBridgeLogGlobal = {
    list() {
      return store.all();
    },
    filter(query) {
      return store.filter(query);
    },
    clear() {
      store.clear();
    },
    copy(id) {
      const entry = store.getById(id);
      if (!entry) {
        return null;
      }
      const serialized = store.serialize([entry]);
      copyText(serialized);
      return serialized;
    },
    export(query) {
      const list = query ? store.filter(query) : store.all();
      const serialized = store.serialize(list);
      copyText(serialized);
      return serialized;
    },
    show() {
      panel?.show();
    },
    hide() {
      panel?.hide();
    },
  };

  if (typeof window !== 'undefined') {
    window.__vkBridgeLog = api;
  }

  return api;
}

/**
 * Synchronously attaches the logger if the activation flag is set. Intended
 * for builds that bundle the logger statically (e.g. the IIFE browser build).
 */
export function attachLoggerIfEnabled(bridge: VKBridge): VkBridgeLogGlobal | null {
  if (!isLogEnabled() || typeof window === 'undefined') {
    return null;
  }
  const tap = createTap(bridge);
  return attachLogger(bridge, tap);
}
