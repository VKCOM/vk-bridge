/// <reference lib="dom" />
import type { LogEntry } from './types.ts';
import type { LogStore } from './store.ts';
import { copyText } from './panel/clipboard.ts';
export { copyText } from './panel/clipboard.ts';
import { ensureStyles, PREFIX } from './panel/styles.ts';
import { formatTime } from './panel/format.ts';
import { buildGroups, entryMatchesQuery, isBridgeEvent } from './panel/groups.ts';
import type { PanelSendFn, PanelState } from './panel/row.ts';
import { renderEntryRow } from './panel/row.ts';
export type { PanelSendFn } from './panel/row.ts';

const MAX_VISIBLE = 200;

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

  const state: PanelState = {
    expanded: new Set<number>(),
    // Entries whose data is shown pretty-printed (toggled per row).
    prettyIds: new Set<number>(),
    // Display order: newest entries at the top by default.
    newestFirst: true,
    filterQuery: '',
  };
  let lastSeenCount = 0;

  function renderEntryRowFor(entry: LogEntry, indent: boolean): HTMLElement {
    return renderEntryRow(store, state, onSend, render, entry, indent);
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
    const q = state.filterQuery.trim().toLowerCase();
    const filtered = all.filter((e) => isBridgeEvent(e) && (!q || entryMatchesQuery(e, q)));
    const visible = filtered.slice(-MAX_VISIBLE);
    const groups = buildGroups(visible);
    // Reverse only the group order; items inside a group stay chronological
    // (request above response) in both modes.
    if (state.newestFirst) {
      groups.reverse();
    }

    list.replaceChildren();

    if (groups.length === 0) {
      const empty = document.createElement('div');
      empty.className = `${PREFIX}-empty`;
      empty.textContent = state.filterQuery ? 'no matches' : 'no messages yet';
      list.appendChild(empty);
      return;
    }

    for (const group of groups) {
      const isGroup = group.items.length > 1;
      const head = group.items[0];

      if (!isGroup) {
        list.appendChild(renderEntryRowFor(head, false));
        continue;
      }

      // Group header row — click toggles child visibility.
      const row = document.createElement('div');
      row.className = `${PREFIX}-row`;

      const caret = document.createElement('span');
      caret.className = `${PREFIX}-caret`;
      caret.textContent = state.expanded.has(group.key) ? '▾' : '▸';

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
        if (state.expanded.has(group.key)) {
          state.expanded.delete(group.key);
        } else {
          state.expanded.add(group.key);
        }
        render();
      };
      row.addEventListener('click', toggleExpand);

      list.appendChild(row);

      if (state.expanded.has(group.key)) {
        const children = document.createElement('div');
        children.className = `${PREFIX}-group-children`;
        for (const item of group.items) {
          children.appendChild(renderEntryRowFor(item, true));
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
      state.filterQuery = filter.value;
      render();
    }, 150);
  });

  clearBtn.addEventListener('click', () => {
    state.expanded.clear();
    store.clear();
  });

  exportBtn.addEventListener('click', () => {
    const q = state.filterQuery.trim().toLowerCase();
    copyText(
      store.serialize(
        store.all().filter((e) => isBridgeEvent(e) && (!q || entryMatchesQuery(e, q))),
      ),
    );
  });

  function updateSortBtn(): void {
    sortBtn.textContent = state.newestFirst ? '↓' : '↑';
    sortBtn.title = state.newestFirst ? 'Newest first' : 'Oldest first';
  }
  sortBtn.addEventListener('click', () => {
    state.newestFirst = !state.newestFirst;
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
