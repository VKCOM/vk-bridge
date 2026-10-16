/// <reference lib="dom" />
import type { LogEntry } from '../types.ts';
import type { LogStore } from '../store.ts';
import { copyText } from './clipboard.ts';
import { bodyWithoutRequestId, dataToString, formatTime } from './format.ts';
import { PREFIX } from './styles.ts';

/**
 * Mutable display state shared between the panel renderer and row builders.
 */
export interface PanelState {
  /** Ids of entries (or group keys) whose children/data are revealed. */
  expanded: Set<number>;
  /** Ids of entries whose data is shown pretty-printed (toggled per row). */
  prettyIds: Set<number>;
  /** Display order: newest entries at the top when true. */
  newestFirst: boolean;
  /** Current text filter query. */
  filterQuery: string;
}

/**
 * Sends a replayed request. Provided by the logger; failures are expected —
 * the caller swallows promise rejections (the Failed event still reaches the
 * log through subscribe).
 */
export type PanelSendFn = (method: string, props: Record<string, unknown>) => void;

/**
 * Builds a single entry row (a standalone entry or a child of a group).
 * `rerender` must re-render the whole panel after state changes.
 */
export function renderEntryRow(
  store: LogStore,
  state: PanelState,
  onSend: PanelSendFn | undefined,
  rerender: () => void,
  entry: LogEntry,
  indent: boolean,
): HTMLElement {
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

  if (state.expanded.has(entry.id)) {
    const data = document.createElement('div');
    data.className = `${PREFIX}-data`;
    data.textContent = dataToString(entry, state.prettyIds.has(entry.id));
    body.appendChild(data);
  }

  body.addEventListener('click', () => {
    if (state.expanded.has(entry.id)) {
      state.expanded.delete(entry.id);
    } else {
      state.expanded.add(entry.id);
    }
    rerender();
  });

  const prettyBtn = document.createElement('button');
  prettyBtn.className = `${PREFIX}-btn ${PREFIX}-copy`;
  prettyBtn.type = 'button';
  prettyBtn.textContent = 'pretty';
  prettyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.prettyIds.has(entry.id)) {
      state.prettyIds.delete(entry.id);
    } else {
      state.prettyIds.add(entry.id);
      // Reveal the data right away so the effect of the toggle is visible.
      state.expanded.add(entry.id);
    }
    rerender();
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
