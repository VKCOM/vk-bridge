import type { LogEntry, LoggerOptions } from './types.ts';

/**
 * Creates a ring-buffered log store with filter/clear/copy helpers and a
 * change-notification mechanism used by the overlay panel to re-render.
 */
export function createLogStore(options: LoggerOptions = {}): LogStore {
  const maxSize = options.maxSize ?? 500;
  const entries: LogEntry[] = [];
  let counter = 0;
  const listeners = new Set<() => void>();

  function notify() {
    for (const fn of listeners) {
      try {
        fn();
      } catch {
        // listener errors must not break the store
      }
    }
  }

  function nextId(): number {
    counter += 1;
    // Wrap around to stay within safe integer range over very long sessions.
    if (counter > 0x7fffffff) {
      counter = 1;
    }
    return counter;
  }

  return {
    maxSize,
    push(entry) {
      const full: LogEntry = { id: nextId(), ...entry };
      entries.push(full);
      if (entries.length > maxSize) {
        entries.splice(0, entries.length - maxSize);
      }
      notify();
    },
    all() {
      return entries.slice();
    },
    filter(query) {
      const q = query.trim().toLowerCase();
      if (!q) {
        return entries.slice();
      }
      return entries.filter((e) => {
        if (e.method.toLowerCase().includes(q)) {
          return true;
        }
        try {
          return JSON.stringify(e.data).toLowerCase().includes(q);
        } catch {
          return false;
        }
      });
    },
    clear() {
      entries.length = 0;
      notify();
    },
    getById(id) {
      return entries.find((e) => e.id === id) ?? null;
    },
    serialize(list) {
      try {
        return JSON.stringify(list, null, 2);
      } catch {
        return JSON.stringify(
          list.map((e) => ({ ...e, data: '[unserializable]' })),
          null,
          2,
        );
      }
    },
    onChange(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export interface LogStore {
  readonly maxSize: number;
  push(entry: Omit<LogEntry, 'id'>): void;
  all(): LogEntry[];
  filter(query: string): LogEntry[];
  clear(): void;
  getById(id: number): LogEntry | null;
  serialize(list: LogEntry[]): string;
  onChange(fn: () => void): () => void;
}
