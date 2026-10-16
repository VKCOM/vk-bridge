import type { LogEntry } from '../types.ts';

/**
 * Only VK Bridge events (VKWebApp* prefix) are displayed and exported; the
 * host app / SDK may dispatch unrelated events that would otherwise clutter
 * the list. The store itself keeps everything (`__vkBridgeLog.list()`).
 */
export function isBridgeEvent(entry: LogEntry): boolean {
  return entry.method.startsWith('VKWebApp');
}

export function entryMatchesQuery(entry: LogEntry, q: string): boolean {
  if (entry.method.toLowerCase().includes(q)) {
    return true;
  }
  try {
    return JSON.stringify(entry.data).toLowerCase().includes(q);
  } catch {
    return false;
  }
}

/**
 * Groups filtered entries by requestId. Entries without a requestId stay as
 * standalone single-entry groups. Returns groups in original order; for a
 * request/response pair the group key is the shared requestId (mapped to the
 * first entry's id for expand/collapse state).
 */
export function buildGroups(entries: LogEntry[]): Array<{ key: number; items: LogEntry[] }> {
  const byReqId = new Map<string, LogEntry[]>();
  const groups: Array<{ key: number; items: LogEntry[] }> = [];
  const order: string[] = [];

  for (const entry of entries) {
    if (entry.requestId != null) {
      const rid = String(entry.requestId);
      let bucket = byReqId.get(rid);
      if (!bucket) {
        bucket = [];
        byReqId.set(rid, bucket);
        order.push(rid);
      }
      bucket.push(entry);
    } else {
      // Standalone entry — its own group keyed by its own id.
      const standaloneKey = `__s_${entry.id}`;
      byReqId.set(standaloneKey, [entry]);
      order.push(standaloneKey);
    }
  }

  for (const rid of order) {
    const items = byReqId.get(rid);
    if (items) {
      groups.push({ key: items[0].id, items });
    }
  }
  return groups;
}
