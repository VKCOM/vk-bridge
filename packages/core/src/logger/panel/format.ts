import type { LogEntry } from '../types.ts';

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, '0')}`;
}

export function dataToString(entry: LogEntry, pretty: boolean): string {
  try {
    if (entry.data === undefined) {
      return '';
    }
    return pretty ? JSON.stringify(entry.data, null, 2) : JSON.stringify(entry.data);
  } catch {
    return String(entry.data);
  }
}

/**
 * Returns a copy of the request body without `request_id` (promisifySend
 * assigns a fresh one on replay; reusing the old id could hijack a still
 * pending original request's promise).
 */
export function bodyWithoutRequestId(data: unknown): Record<string, unknown> {
  if (data && typeof data === 'object') {
    const { request_id: _omit, ...rest } = data as Record<string, unknown>;
    return rest;
  }
  return {};
}
