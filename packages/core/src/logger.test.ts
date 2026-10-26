/* eslint-disable @typescript-eslint/no-floating-promises */
import { describe, it, beforeEach, afterEach } from 'node:test';
import * as assert from 'node:assert';
import { isLogEnabled } from './logger/detect.ts';
import { createLogStore } from './logger/store.ts';
import { createTap, removeTap } from './logger/tap.ts';
import { attachLogger } from './logger/index.ts';
import { buildGroups, entryMatchesQuery, isBridgeEvent, countUnseen } from './logger/panel/groups.ts';
import { bodyWithoutRequestId, dataToString } from './logger/panel/format.ts';
import type { VKBridge } from './types/bridge.ts';
import type { LogEntry } from './logger/types.ts';

function entryOf(partial: Partial<LogEntry>): LogEntry {
  return {
    id: 1,
    dir: 'out',
    method: 'VKWebAppInit',
    data: undefined,
    ts: 0,
    ...partial,
  };
}

describe('isLogEnabled', () => {
  const originalLocal = (globalThis as any).localStorage;
  const originalLocation = (globalThis as any).location;

  function setEnv(hash: string, search: string, storageValue: string | null) {
    const store: Record<string, string> = {};
    if (storageValue !== null) {
      store['vk-bridge-log'] = storageValue;
    }
    (globalThis as any).localStorage = {
      getItem: (k: string) => (k in store ? store[k] : null),
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    };
    (globalThis as any).location = { hash, search };
  }

  beforeEach(() => {
    setEnv('', '', null);
  });

  afterEach(() => {
    (globalThis as any).localStorage = originalLocal;
    (globalThis as any).location = originalLocation;
  });

  it('returns false when no flag is set', () => {
    assert.strictEqual(isLogEnabled(), false);
  });

  it('returns true for vk_log=1 in hash', () => {
    setEnv('#vk_log=1', '', null);
    assert.strictEqual(isLogEnabled(), true);
  });

  it('returns true for vk_log=1 in search', () => {
    setEnv('', '?vk_log=1&foo=bar', null);
    assert.strictEqual(isLogEnabled(), true);
  });

  it('returns true for localStorage flag', () => {
    setEnv('', '', '1');
    assert.strictEqual(isLogEnabled(), true);
  });

  it('returns false for other values', () => {
    setEnv('#vk_log=0', '', null);
    assert.strictEqual(isLogEnabled(), false);
  });
});

describe('createLogStore', () => {
  it('caps entries at maxSize', () => {
    const store = createLogStore({ maxSize: 3 });
    store.push({ dir: 'out', method: 'A', data: 1, ts: 1 });
    store.push({ dir: 'out', method: 'B', data: 2, ts: 2 });
    store.push({ dir: 'out', method: 'C', data: 3, ts: 3 });
    store.push({ dir: 'out', method: 'D', data: 4, ts: 4 });
    const all = store.all();
    assert.strictEqual(all.length, 3);
    assert.deepStrictEqual(
      all.map((e) => e.method),
      ['B', 'C', 'D'],
    );
  });

  it('assigns sequential ids and wraps entries', () => {
    const store = createLogStore({ maxSize: 2 });
    store.push({ dir: 'out', method: 'A', data: 1, ts: 1 });
    store.push({ dir: 'out', method: 'B', data: 2, ts: 2 });
    store.push({ dir: 'out', method: 'C', data: 3, ts: 3 });
    const ids = store.all().map((e) => e.id);
    assert.ok(ids[0] < ids[1], 'ids are increasing');
  });

  it('filters by method and data substring', () => {
    const store = createLogStore();
    store.push({ dir: 'out', method: 'VKWebAppInit', data: { foo: 1 }, ts: 1 });
    store.push({ dir: 'in', method: 'VKWebAppUpdateInsets', data: { insets: 10 }, ts: 2 });
    assert.strictEqual(store.filter('init').length, 1);
    assert.strictEqual(store.filter('VKWebApp').length, 2);
    assert.strictEqual(store.filter('insets').length, 1);
    assert.strictEqual(store.filter('').length, 2);
  });

  it('serializes pretty-printed (copy contract)', () => {
    const store = createLogStore();
    store.push({ dir: 'out', method: 'VKWebAppInit', data: { a: 1, b: { c: 2 } }, ts: 1 });
    const serialized = store.serialize(store.all());
    // Pretty format: multi-line JSON with 2-space indent.
    assert.strictEqual(
      serialized,
      JSON.stringify(store.all(), null, 2),
      'serialize must be JSON.stringify(list, null, 2)',
    );
  });

  it('clears all entries', () => {
    const store = createLogStore();
    store.push({ dir: 'out', method: 'A', data: 1, ts: 1 });
    store.clear();
    assert.strictEqual(store.all().length, 0);
  });

  it('notifies listeners on push and clear', () => {
    const store = createLogStore();
    let calls = 0;
    store.onChange(() => {
      calls += 1;
    });
    store.push({ dir: 'out', method: 'A', data: 1, ts: 1 });
    store.clear();
    assert.strictEqual(calls, 2);
  });
});

describe('createTap', () => {
  function mockBridge() {
    const subscribers: Array<(event: any) => void> = [];
    let sendImpl: (...args: any[]) => any = async () => undefined;
    let onSendFn: ((method: any, props: any) => void) | undefined;
    const bridge: any = {
      // Emulates promisifySend: invokes the onSend hook (if registered) with
      // the final props (including request_id) before dispatching.
      send: (...args: any[]) => {
        const [method, props] = args;
        onSendFn?.(method, props);
        return sendImpl(...args);
      },
      subscribe: (fn: (event: any) => void) => subscribers.push(fn),
      unsubscribe: (fn: (event: any) => void) => {
        const i = subscribers.indexOf(fn);
        if (i > -1) {
          subscribers.splice(i, 1);
        }
      },
      __setOnSend: (fn?: (method: any, props: any) => void) => {
        onSendFn = fn;
      },
    };
    return {
      bridge: bridge as VKBridge,
      emit: (event: any) => {
        subscribers.slice().forEach((fn) => {
          fn(event);
        });
      },
      setSend: (fn: (...args: any[]) => any) => {
        sendImpl = fn;
      },
    };
  }

  it('captures outgoing (with request_id) and incoming via tap', async () => {
    const { bridge, emit } = mockBridge();
    const tap = createTap(bridge as any);
    // Outgoing: bridge.send triggers the onSend hook registered by the tap.
    await bridge.send('VKWebAppInit', { request_id: '1' });
    // Incoming: a response with request_id in its data.
    emit({ detail: { type: 'VKWebAppInitResult', data: { request_id: '1', result: 'ok' } } });
    assert.strictEqual(tap.pending.length, 2);
    assert.strictEqual(tap.pending[0].dir, 'out');
    assert.strictEqual(tap.pending[0].method, 'VKWebAppInit');
    assert.strictEqual(tap.pending[0].requestId, '1');
    assert.strictEqual(tap.pending[1].dir, 'in');
    assert.strictEqual(tap.pending[1].method, 'VKWebAppInitResult');
    assert.strictEqual(tap.pending[1].requestId, '1');
  });

  it('clears the onSend hook on removeTap', async () => {
    const { bridge } = mockBridge();
    const tap = createTap(bridge as any);
    removeTap(bridge as any, tap);
    // After removeTap, sending should not push into pending.
    await bridge.send('VKWebAppInit', { request_id: '2' });
    assert.strictEqual(tap.pending.length, 0);
  });
});

describe('attachLogger', () => {
  function mockBridge() {
    const subscribers: Array<(event: any) => void> = [];
    let sendImpl: (...args: any[]) => any = async () => undefined;
    let onSendFn: ((method: any, props: any) => void) | undefined;
    const bridge: any = {
      // Emulates promisifySend: invokes the onSend hook (if registered) with
      // the final props (including request_id) before dispatching.
      send: (...args: any[]) => {
        const [method, props] = args;
        onSendFn?.(method, props);
        return sendImpl(...args);
      },
      subscribe: (fn: (event: any) => void) => subscribers.push(fn),
      unsubscribe: (fn: (event: any) => void) => {
        const i = subscribers.indexOf(fn);
        if (i > -1) {
          subscribers.splice(i, 1);
        }
      },
      __setOnSend: (fn?: (method: any, props: any) => void) => {
        onSendFn = fn;
      },
    };
    return {
      bridge: bridge as VKBridge,
      emit: (event: any) => {
        subscribers.slice().forEach((fn) => {
          fn(event);
        });
      },
      setSend: (fn: (...args: any[]) => any) => {
        sendImpl = fn;
      },
    };
  }

  it('logs outgoing (with request_id) via onSend and incoming via subscribe', async () => {
    const { bridge, emit } = mockBridge();
    const tap = createTap(bridge as any);
    // Simulate a buffered message from before attach.
    tap.pending.push({ id: 0, dir: 'out', method: 'Buffered', data: 1, ts: 0 });

    const api = attachLogger(bridge, tap);

    // Drained pending entry is present.
    assert.ok(api.list().some((e) => e.method === 'Buffered'));

    // Outgoing via onSend hook (triggered by bridge.send).
    await bridge.send('VKWebAppInit', { request_id: '42' });
    const outEntry = api.list().find((e) => e.method === 'VKWebAppInit' && e.dir === 'out');
    assert.ok(outEntry, 'outgoing entry logged');
    assert.strictEqual(outEntry?.requestId, '42');

    // Incoming via subscribe, with matching request_id.
    emit({ detail: { type: 'VKWebAppInitResult', data: { request_id: '42', result: 'ok' } } });
    const inEntry = api.list().find((e) => e.method === 'VKWebAppInitResult' && e.dir === 'in');
    assert.ok(inEntry, 'incoming entry logged');
    assert.strictEqual(inEntry?.requestId, '42');

    // Filter works.
    assert.strictEqual(api.filter('Init').length, 2);

    // Clear works.
    api.clear();
    assert.strictEqual(api.list().length, 0);
  });

  it('exposes window.__vkBridgeLog', () => {
    const { bridge } = mockBridge();
    const tap = createTap(bridge as any);
    const original = (globalThis as any).window;
    const win: any = {};
    (globalThis as any).window = win;
    try {
      attachLogger(bridge, tap);
      assert.ok(typeof win.__vkBridgeLog === 'object');
      assert.strictEqual(typeof win.__vkBridgeLog.list, 'function');
    } finally {
      (globalThis as any).window = original;
    }
  });
});

describe('countUnseen', () => {
  it('returns 0 for an empty list', () => {
    assert.strictEqual(countUnseen([], 0), 0);
  });

  it('counts all entries when nothing has been seen', () => {
    const entries = [entryOf({ id: 1 }), entryOf({ id: 2 }), entryOf({ id: 3 })];
    assert.strictEqual(countUnseen(entries, 0), 3);
  });

  it('counts entries past lastSeenId even after ring-buffer eviction (bug regression)', () => {
    // Ids 1..6 were pushed into a maxSize-3 store: only ids 4..6 remain.
    // The old length-based formula (3 - 3) reported 0 new entries.
    const entries = [entryOf({ id: 4 }), entryOf({ id: 5 }), entryOf({ id: 6 })];
    assert.strictEqual(countUnseen(entries, 3), 3);
    assert.strictEqual(countUnseen(entries, 4), 2);
  });

  it('clamps to 0 when lastSeenId is ahead (after clear)', () => {
    const entries = [entryOf({ id: 1 })];
    assert.strictEqual(countUnseen(entries, 5), 0);
  });
});

describe('buildGroups', () => {
  it('groups request/response pairs by requestId', () => {
    const entries = [
      entryOf({ id: 1, requestId: '42' }),
      entryOf({ id: 2, method: 'VKWebAppOther' }),
      entryOf({ id: 3, dir: 'in', method: 'VKWebAppInitResult', requestId: '42' }),
    ];
    const groups = buildGroups(entries);
    assert.strictEqual(groups.length, 2);
    // Order of first appearance.
    assert.strictEqual(groups[0].key, 1);
    assert.strictEqual(groups[0].items.length, 2);
    assert.deepStrictEqual(
      groups[0].items.map((e) => e.id),
      [1, 3],
      'items stay chronological inside a group',
    );
    assert.strictEqual(groups[1].key, 2);
    assert.strictEqual(groups[1].items.length, 1);
  });

  it('keys standalone entries by their own id', () => {
    const groups = buildGroups([entryOf({ id: 7 })]);
    assert.strictEqual(groups.length, 1);
    assert.strictEqual(groups[0].key, 7);
  });
});

describe('isBridgeEvent / entryMatchesQuery', () => {
  it('accepts only VKWebApp* methods', () => {
    assert.strictEqual(isBridgeEvent(entryOf({ method: 'VKWebAppInit' })), true);
    assert.strictEqual(isBridgeEvent(entryOf({ method: 'VKWebAppInitResult' })), true);
    assert.strictEqual(isBridgeEvent(entryOf({ method: 'ACTION' })), false);
    assert.strictEqual(isBridgeEvent(entryOf({ method: 'vkWebAppInit' })), false);
  });

  it('matches by method and data substring', () => {
    const entry = entryOf({ method: 'VKWebAppInit', data: { foo: 'Bar' } });
    assert.strictEqual(entryMatchesQuery(entry, 'init'), true);
    assert.strictEqual(entryMatchesQuery(entry, 'bar'), true);
    assert.strictEqual(entryMatchesQuery(entry, 'nope'), false);
  });

  it('entryMatchesQuery with empty query matches everything', () => {
    assert.strictEqual(entryMatchesQuery(entryOf({}), ''), true);
  });
});

describe('dataToString', () => {
  it('prints plain and pretty JSON', () => {
    const entry = entryOf({ data: { a: 1 } });
    assert.strictEqual(dataToString(entry, false), '{"a":1}');
    assert.strictEqual(dataToString(entry, true), '{\n  "a": 1\n}');
  });

  it('prints an empty string for undefined data', () => {
    assert.strictEqual(dataToString(entryOf({ data: undefined }), false), '');
  });

  it('falls back to String() for unserializable data', () => {
    const circular: any = {};
    circular.self = circular;
    const out = dataToString(entryOf({ data: circular }), false);
    assert.strictEqual(typeof out, 'string');
    assert.strictEqual(out, String(circular));
  });
});

describe('bodyWithoutRequestId', () => {
  it('strips request_id and keeps the rest', () => {
    const body = bodyWithoutRequestId({ request_id: '42', foo: 1 });
    assert.deepStrictEqual(body, { foo: 1 });
  });

  it('returns an empty object for non-object data', () => {
    assert.deepStrictEqual(bodyWithoutRequestId(undefined), {});
    assert.deepStrictEqual(bodyWithoutRequestId('str'), {});
  });
});
