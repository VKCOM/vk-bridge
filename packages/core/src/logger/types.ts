/**
 * Direction of a logged message.
 * - 'out': message sent from the mini-app to the platform (bridge.send).
 * - 'in': message received from the platform (subscribe event).
 */
export type LogEntryDir = 'in' | 'out';

/**
 * A single log entry — one incoming or one outgoing bridge message.
 */
export interface LogEntry {
  /** Sequential id, assigned by the store. */
  id: number;
  /** Direction of the message. */
  dir: LogEntryDir;
  /** Method (event) name, e.g. 'VKWebAppInit'. */
  method: string;
  /** Payload of the message (props for 'out', data for 'in'). */
  data: unknown;
  /** Timestamp (ms, Date.now()). */
  ts: number;
  /** request_id for outgoing requests, when present. */
  requestId?: string | number;
}

/**
 * Options for the log store.
 */
export interface LoggerOptions {
  /** Max entries kept in the ring buffer. Defaults to 500. */
  maxSize?: number;
}

/**
 * Handle returned by the synchronous tap installed before the logger module
 * finishes loading. The logger drains and replaces it.
 */
export interface TapHandle {
  /** Entries buffered while the logger module was loading. */
  pending: LogEntry[];
  /** Original (unwrapped) send, to restore on attach. */
  origSend: VKBridgeSendLike;
  /** Incoming listener subscribed by the tap, to unsubscribe on attach. */
  incomingListener: (event: any) => void;
  /** Outgoing hook registered via bridge.__setOnSend, to re-register on attach. */
  onSend: (method: any, props: any) => void;
}

/**
 * Minimal send signature used by the tap (avoids pulling complex generics
 * into the lightweight tap module).
 */
export type VKBridgeSendLike = (method: any, props?: any) => any;
