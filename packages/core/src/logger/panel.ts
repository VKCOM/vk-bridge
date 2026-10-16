/// <reference lib="dom" />
import type { LogEntry } from './types.ts';
import type { LogStore } from './store.ts';

const PREFIX = 'vk-bridge-log';
const STYLE_ID = `${PREFIX}-style`;
const MAX_VISIBLE = 200;

/**
 * Copies text to the clipboard, falling back to a hidden textarea +
 * execCommand for webviews where the async Clipboard API is unavailable.
 */
export function copyText(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  }
  return Promise.resolve(fallbackCopy(text));
}

function fallbackCopy(text: string): void {
  if (typeof document === 'undefined') {
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.top = '0';
  ta.style.left = '0';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    document.execCommand('copy');
  } catch {
    // ignore
  }
  ta.remove();
}

function ensureStyles(): void {
  if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
    return;
  }
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
.${PREFIX}-root{all:initial;position:fixed;z-index:2147483647;right:12px;bottom:12px;
  width:360px;max-width:calc(100vw - 24px);height:320px;max-height:calc(100vh - 24px);
  display:flex;flex-direction:column;font:12px/1.4 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
  color:#e8e8e8;background:#1e1e1e;border:1px solid #3a3a3a;border-radius:8px;
  box-shadow:0 8px 24px rgba(0,0,0,.4);box-sizing:border-box}
.${PREFIX}-root *{all:revert;box-sizing:border-box}
.${PREFIX}-head{display:flex;align-items:center;gap:6px;padding:6px 8px;cursor:move;touch-action:none;
  background:#252526;border-bottom:1px solid #3a3a3a;border-radius:8px 8px 0 0;user-select:none}
.${PREFIX}-title{font-weight:600;font-size:12px;flex:0 0 auto}
.${PREFIX}-count{font-size:10px;color:#9aa;background:#333;padding:1px 5px;border-radius:8px;flex:0 0 auto}
.${PREFIX}-filter{flex:1 1 auto;min-width:40px;font-size:11px;padding:2px 6px;border:1px solid #444;
  border-radius:4px;background:#1e1e1e;color:#e8e8e8}
.${PREFIX}-btn{font-size:11px;padding:2px 6px;border:1px solid #444;border-radius:4px;background:#2d2d2d;
  color:#ddd;cursor:pointer;flex:0 0 auto}
.${PREFIX}-btn:hover{background:#3a3a3a}
.${PREFIX}-list{flex:1 1 auto;overflow-y:auto;padding:4px 0}
.${PREFIX}-row{display:flex;align-items:flex-start;gap:6px;padding:3px 8px;border-bottom:1px solid #2a2a2a}
.${PREFIX}-row:hover{background:#262626}
.${PREFIX}-dir{flex:0 0 auto;font-weight:700;width:12px;text-align:center}
.${PREFIX}-dir-out{color:#4ec9b0}
.${PREFIX}-dir-in{color:#569cd6}
.${PREFIX}-body{flex:1 1 auto;min-width:0;cursor:pointer}
.${PREFIX}-method{font-weight:600;color:#dcdcaa;word-break:break-all}
.${PREFIX}-meta{color:#888;font-size:10px}
.${PREFIX}-data{color:#ccc;font-size:11px;white-space:pre-wrap;word-break:break-word;margin-top:2px;
  max-height:240px;overflow:auto}
.${PREFIX}-copy{flex:0 0 auto;font-size:10px}
.${PREFIX}-empty{padding:16px;text-align:center;color:#777}
.${PREFIX}-group-children{margin-left:18px;border-left:1px solid #333;padding-left:4px}
.${PREFIX}-child-row{display:flex;align-items:flex-start;gap:6px;padding:2px 4px}
.${PREFIX}-group-count{font-size:10px;color:#9aa;background:#333;padding:1px 5px;border-radius:8px;flex:0 0 auto}
.${PREFIX}-caret{flex:0 0 auto;width:10px;color:#888;cursor:pointer;text-align:center}
.${PREFIX}-fab{all:initial;position:fixed!important;z-index:2147483647!important;right:12px!important;
  bottom:12px!important;width:44px!important;height:44px!important;box-sizing:border-box!important;
  border-radius:50%!important;background:#0077ff!important;color:#fff!important;
  font:600 16px/44px -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif!important;
  text-align:center;cursor:pointer;border:none;box-shadow:0 4px 12px rgba(0,0,0,.4);
  touch-action:none;user-select:none;display:flex;align-items:center;justify-content:center}
.${PREFIX}-fab:hover{background:#0066dd}
.${PREFIX}-fab-badge{position:absolute;top:-4px;right:-4px;min-width:16px;height:16px;padding:0 4px;
  border-radius:8px;background:#e64646;color:#fff;font-size:10px;line-height:16px;text-align:center;
  font-weight:700;display:none}
`.replace(/\n\s*/g, '');
  document.head.appendChild(style);
}

function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, '0')}`;
}

function dataToString(entry: LogEntry, pretty: boolean): string {
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
function bodyWithoutRequestId(data: unknown): Record<string, unknown> {
  if (data && typeof data === 'object') {
    const { request_id: _omit, ...rest } = data as Record<string, unknown>;
    return rest;
  }
  return {};
}

/**
 * Sends a replayed request. Provided by the logger; failures are expected —
 * the caller swallows promise rejections (the Failed event still reaches the
 * log through subscribe).
 */
export type PanelSendFn = (method: string, props: Record<string, unknown>) => void;

/**
 * Mounts the overlay panel into the document body and wires it to the store.
 * Returns a control handle (`show`/`hide`).
 */
export function mountPanel(store: LogStore, onSend?: PanelSendFn): PanelHandle {
  if (typeof document === 'undefined') {
    return { show() {}, hide() {} };
  }
  ensureStyles();

  const root = document.createElement('div');
  root.className = `${PREFIX}-root`;
  // Start hidden — the panel is opened via the floating button.
  root.style.display = 'none';

  // Floating action button (FAB) — shown when the panel is closed.
  const fab = document.createElement('button');
  fab.className = `${PREFIX}-fab`;
  fab.type = 'button';
  fab.title = 'VK Bridge Log';
  fab.textContent = '🪵';
  const fabBadge = document.createElement('span');
  fabBadge.className = `${PREFIX}-fab-badge`;
  fabBadge.textContent = '0';
  fab.append(fabBadge);

  const head = document.createElement('div');
  head.className = `${PREFIX}-head`;

  const title = document.createElement('span');
  title.className = `${PREFIX}-title`;
  title.textContent = 'VK Bridge Log';

  const count = document.createElement('span');
  count.className = `${PREFIX}-count`;
  count.textContent = '0';

  const filter = document.createElement('input');
  filter.className = `${PREFIX}-filter`;
  filter.type = 'text';
  filter.placeholder = 'filter…';
  filter.value = '';

  const exportBtn = document.createElement('button');
  exportBtn.className = `${PREFIX}-btn`;
  exportBtn.type = 'button';
  exportBtn.textContent = 'export';

  const sortBtn = document.createElement('button');
  sortBtn.className = `${PREFIX}-btn`;
  sortBtn.type = 'button';

  const clearBtn = document.createElement('button');
  clearBtn.className = `${PREFIX}-btn`;
  clearBtn.type = 'button';
  clearBtn.textContent = 'clear';

  const hideBtn = document.createElement('button');
  hideBtn.className = `${PREFIX}-btn`;
  hideBtn.type = 'button';
  hideBtn.textContent = '×';

  head.append(title, count, filter, sortBtn, exportBtn, clearBtn, hideBtn);

  const list = document.createElement('div');
  list.className = `${PREFIX}-list`;

  root.append(head, list);
  document.body.appendChild(root);
  document.body.appendChild(fab);

  const expanded = new Set<number>();
  // Entries whose data is shown pretty-printed (toggled per row).
  const prettyIds = new Set<number>();
  // Display order: newest entries at the top by default.
  let newestFirst = true;
  let filterQuery = '';
  let lastSeenCount = 0;

  /**
   * Groups filtered entries by requestId. Entries without a requestId stay as
   * standalone single-entry groups. Returns groups in original order; for a
   * request/response pair the group key is the shared requestId (mapped to the
   * first entry's id for expand/collapse state).
   */
  function buildGroups(entries: LogEntry[]): Array<{ key: number; items: LogEntry[] }> {
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

  function entryMatchesQuery(entry: LogEntry, q: string): boolean {
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
   * Only VK Bridge events (VKWebApp* prefix) are displayed and exported; the
   * host app / SDK may dispatch unrelated events that would otherwise clutter
   * the list. The store itself keeps everything (`__vkBridgeLog.list()`).
   */
  function isBridgeEvent(entry: LogEntry): boolean {
    return entry.method.startsWith('VKWebApp');
  }

  function renderEntryRow(entry: LogEntry, indent: boolean): HTMLElement {
    const row = document.createElement('div');
    row.className = indent ? `${PREFIX}-child-row` : `${PREFIX}-row`;

    const dir = document.createElement('span');
    dir.className = `${PREFIX}-dir ${PREFIX}-dir-${entry.dir}`;
    dir.textContent = entry.dir === 'out' ? '↑' : '↓';

    const body = document.createElement('div');
    body.className = `${PREFIX}-body`;

    const method = document.createElement('div');
    method.className = `${PREFIX}-method`;
    method.textContent = entry.method;

    const meta = document.createElement('div');
    meta.className = `${PREFIX}-meta`;
    meta.textContent = formatTime(entry.ts) + (entry.requestId ? ` · #${entry.requestId}` : '');

    body.append(method, meta);

    if (expanded.has(entry.id)) {
      const data = document.createElement('div');
      data.className = `${PREFIX}-data`;
      data.textContent = dataToString(entry, prettyIds.has(entry.id));
      body.appendChild(data);
    }

    body.addEventListener('click', () => {
      if (expanded.has(entry.id)) {
        expanded.delete(entry.id);
      } else {
        expanded.add(entry.id);
      }
      render();
    });

    const prettyBtn = document.createElement('button');
    prettyBtn.className = `${PREFIX}-btn ${PREFIX}-copy`;
    prettyBtn.type = 'button';
    prettyBtn.textContent = 'pretty';
    prettyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (prettyIds.has(entry.id)) {
        prettyIds.delete(entry.id);
      } else {
        prettyIds.add(entry.id);
        // Reveal the data right away so the effect of the toggle is visible.
        expanded.add(entry.id);
      }
      render();
    });

    row.append(dir, body, prettyBtn);

    if (entry.dir === 'out' && onSend) {
      const sendBtn = document.createElement('button');
      sendBtn.className = `${PREFIX}-btn ${PREFIX}-copy`;
      sendBtn.type = 'button';
      sendBtn.textContent = 'send';
      sendBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onSend(entry.method, bodyWithoutRequestId(entry.data));
      });
      row.append(sendBtn);
    }

    const copyBtn = document.createElement('button');
    copyBtn.className = `${PREFIX}-btn ${PREFIX}-copy`;
    copyBtn.type = 'button';
    copyBtn.textContent = 'copy';
    copyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyText(store.serialize([entry]));
    });

    row.append(copyBtn);
    return row;
  }

  function render(): void {
    const all = store.all();
    count.textContent = String(all.length);
    // FAB badge: show count of entries since the panel was last opened.
    const unseen = all.length - lastSeenCount;
    if (unseen > 0) {
      fabBadge.textContent = String(unseen);
      fabBadge.style.display = 'block';
    } else {
      fabBadge.style.display = 'none';
    }

    // Apply filters, then cap to the most recent MAX_VISIBLE entries.
    const q = filterQuery.trim().toLowerCase();
    const filtered = all.filter((e) => isBridgeEvent(e) && (!q || entryMatchesQuery(e, q)));
    const visible = filtered.slice(-MAX_VISIBLE);
    const groups = buildGroups(visible);
    // Reverse only the group order; items inside a group stay chronological
    // (request above response) in both modes.
    if (newestFirst) {
      groups.reverse();
    }

    list.replaceChildren();

    if (groups.length === 0) {
      const empty = document.createElement('div');
      empty.className = `${PREFIX}-empty`;
      empty.textContent = filterQuery ? 'no matches' : 'no messages yet';
      list.appendChild(empty);
      return;
    }

    for (const group of groups) {
      const isGroup = group.items.length > 1;
      const head = group.items[0];

      if (!isGroup) {
        list.appendChild(renderEntryRow(head, false));
        continue;
      }

      // Group header row — click toggles child visibility.
      const row = document.createElement('div');
      row.className = `${PREFIX}-row`;

      const caret = document.createElement('span');
      caret.className = `${PREFIX}-caret`;
      caret.textContent = expanded.has(group.key) ? '▾' : '▸';

      const body = document.createElement('div');
      body.className = `${PREFIX}-body`;

      const method = document.createElement('div');
      method.className = `${PREFIX}-method`;
      method.textContent = head.method;

      const meta = document.createElement('div');
      meta.className = `${PREFIX}-meta`;
      const reqId = head.requestId;
      const dirs = group.items.map((i) => (i.dir === 'out' ? '↑' : '↓')).join(' ');
      meta.textContent = `${formatTime(head.ts)} · #${reqId} · ${dirs}`;

      body.append(method, meta);

      const copyBtn = document.createElement('button');
      copyBtn.className = `${PREFIX}-btn ${PREFIX}-copy`;
      copyBtn.type = 'button';
      copyBtn.textContent = 'copy';
      copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        copyText(store.serialize(group.items));
      });

      row.append(caret, body, copyBtn);

      const toggleExpand = () => {
        if (expanded.has(group.key)) {
          expanded.delete(group.key);
        } else {
          expanded.add(group.key);
        }
        render();
      };
      row.addEventListener('click', toggleExpand);

      list.appendChild(row);

      if (expanded.has(group.key)) {
        const children = document.createElement('div');
        children.className = `${PREFIX}-group-children`;
        for (const item of group.items) {
          children.appendChild(renderEntryRow(item, true));
        }
        list.appendChild(children);
      }
    }
  }

  let renderTimer: ReturnType<typeof setTimeout> | undefined;
  function scheduleRender(): void {
    if (renderTimer) {
      return;
    }
    renderTimer = setTimeout(() => {
      renderTimer = undefined;
      render();
    }, 50);
  }

  let filterTimer: ReturnType<typeof setTimeout> | undefined;
  filter.addEventListener('input', () => {
    if (filterTimer) {
      clearTimeout(filterTimer);
    }
    filterTimer = setTimeout(() => {
      filterQuery = filter.value;
      render();
    }, 150);
  });

  clearBtn.addEventListener('click', () => {
    expanded.clear();
    store.clear();
  });

  exportBtn.addEventListener('click', () => {
    const q = filterQuery.trim().toLowerCase();
    copyText(
      store.serialize(
        store.all().filter((e) => isBridgeEvent(e) && (!q || entryMatchesQuery(e, q))),
      ),
    );
  });

  function updateSortBtn(): void {
    sortBtn.textContent = newestFirst ? '↓' : '↑';
    sortBtn.title = newestFirst ? 'Newest first' : 'Oldest first';
  }
  sortBtn.addEventListener('click', () => {
    newestFirst = !newestFirst;
    updateSortBtn();
    render();
  });
  updateSortBtn();

  // Toggle logic: FAB opens the panel, hide button closes it back to the FAB.
  function showPanel(): void {
    root.style.display = 'flex';
    fab.style.display = 'none';
    lastSeenCount = store.all().length;
    fabBadge.style.display = 'none';
    render();
  }

  function hidePanel(): void {
    root.style.display = 'none';
    fab.style.display = 'flex';
  }

  hideBtn.addEventListener('click', hidePanel);

  // Dragging the FAB (Pointer Events cover both mouse and touch). A tap
  // without movement still opens the panel; a real drag does not.
  const FAB_POS_KEY = 'vk-bridge-log-fab-pos';
  const DRAG_THRESHOLD = 5;
  let fabDragging = false;
  let suppressFabClick = false;
  let fabPointerId = -1;
  let fabStartX = 0;
  let fabStartY = 0;
  let fabGrabOffsetX = 0;
  let fabGrabOffsetY = 0;

  function clampFab(left: number, top: number): { left: number; top: number } {
    const width = fab.offsetWidth || 44;
    const height = fab.offsetHeight || 44;
    const maxLeft = Math.max(0, window.innerWidth - width);
    const maxTop = Math.max(0, window.innerHeight - height);
    return {
      left: Math.min(Math.max(0, left), maxLeft),
      top: Math.min(Math.max(0, top), maxTop),
    };
  }

  function setFabPosition(left: number, top: number): void {
    const pos = clampFab(left, top);
    // Inline !important declarations beat the !important ones in the
    // stylesheet (needed because the class also uses !important).
    fab.style.setProperty('left', `${pos.left}px`, 'important');
    fab.style.setProperty('top', `${pos.top}px`, 'important');
    fab.style.setProperty('right', 'auto', 'important');
    fab.style.setProperty('bottom', 'auto', 'important');
  }

  function restoreFabPosition(): void {
    try {
      const raw = localStorage.getItem(FAB_POS_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as { left?: unknown; top?: unknown };
      if (typeof parsed.left !== 'number' || typeof parsed.top !== 'number') {
        return;
      }
      // Clamped, in case the viewport changed since the position was saved.
      setFabPosition(parsed.left, parsed.top);
    } catch {
      // ignore — keep the default position
    }
  }

  fab.addEventListener('pointerdown', (e: PointerEvent) => {
    if (!e.isPrimary) {
      return;
    }
    const rect = fab.getBoundingClientRect();
    fabPointerId = e.pointerId;
    fabStartX = e.clientX;
    fabStartY = e.clientY;
    fabGrabOffsetX = e.clientX - rect.left;
    fabGrabOffsetY = e.clientY - rect.top;
    fabDragging = false;
    fab.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  fab.addEventListener('pointermove', (e: PointerEvent) => {
    if (e.pointerId !== fabPointerId) {
      return;
    }
    if (!fabDragging) {
      if (
        Math.abs(e.clientX - fabStartX) < DRAG_THRESHOLD &&
        Math.abs(e.clientY - fabStartY) < DRAG_THRESHOLD
      ) {
        return;
      }
      fabDragging = true;
    }
    setFabPosition(e.clientX - fabGrabOffsetX, e.clientY - fabGrabOffsetY);
  });
  const fabPointerEnd = (e: PointerEvent): void => {
    if (e.pointerId !== fabPointerId) {
      return;
    }
    fabPointerId = -1;
    if (fabDragging) {
      suppressFabClick = true;
      const rect = fab.getBoundingClientRect();
      try {
        localStorage.setItem(FAB_POS_KEY, JSON.stringify({ left: rect.left, top: rect.top }));
      } catch {
        // ignore — the position just won't persist
      }
    }
    fabDragging = false;
  };
  fab.addEventListener('pointerup', fabPointerEnd);
  fab.addEventListener('pointercancel', fabPointerEnd);

  fab.addEventListener('click', () => {
    if (suppressFabClick) {
      suppressFabClick = false;
      return;
    }
    showPanel();
  });

  restoreFabPosition();

  // Dragging the panel by its header. Pointer Events cover both mouse and
  // touch; capture on the header keeps the move/up events even when the
  // pointer leaves the header, so no document-level listeners are needed.
  let dragging = false;
  let startX = 0;
  let startY = 0;
  let startRight = 0;
  let startBottom = 0;
  head.addEventListener('pointerdown', (e: PointerEvent) => {
    // Skip interactive elements: capturing the pointer here would retarget
    // the subsequent click to the header, breaking the buttons' handlers.
    const target = e.target as HTMLElement | null;
    if (target === filter || target?.closest('button')) {
      return;
    }
    dragging = true;
    startX = e.clientX;
    startY = e.clientY;
    const rect = root.getBoundingClientRect();
    startRight = window.innerWidth - rect.right;
    startBottom = window.innerHeight - rect.bottom;
    head.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  head.addEventListener('pointermove', (e: PointerEvent) => {
    if (!dragging) {
      return;
    }
    const right = Math.max(0, startRight - (e.clientX - startX));
    const bottom = Math.max(0, startBottom - (e.clientY - startY));
    root.style.right = `${right}px`;
    root.style.bottom = `${bottom}px`;
  });
  const headPointerEnd = (): void => {
    dragging = false;
  };
  head.addEventListener('pointerup', headPointerEnd);
  head.addEventListener('pointercancel', headPointerEnd);

  const unsub = store.onChange(scheduleRender);
  render();

  return {
    show() {
      showPanel();
    },
    hide() {
      hidePanel();
    },
    destroy() {
      unsub();
      root.remove();
      fab.remove();
    },
  };
}

export interface PanelHandle {
  show(): void;
  hide(): void;
  destroy?(): void;
}
