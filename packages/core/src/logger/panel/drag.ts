/// <reference lib="dom" />

export interface DragHandlers {
  /**
   * Called on pointerdown before the drag session starts. Return `false` to
   * skip dragging (e.g. the pointer landed on a button or an input inside
   * the element). Skipping matters: capturing the pointer would retarget the
   * subsequent click to the drag element and break inner click handlers.
   */
  onStart?(e: PointerEvent): boolean | void;
  /** Called on pointermove once the movement exceeds the threshold. */
  onMove(e: PointerEvent, deltaX: number, deltaY: number): void;
  /** Called on pointerup/pointercancel; `moved` tells a real drag from a tap. */
  onEnd?(moved: boolean): void;
  /** Movement threshold (px) before the gesture counts as a drag. Default 0. */
  threshold?: number;
}

/**
 * Pointer-Events drag helper (covers both mouse and touch). Capture on the
 * element keeps the move/up events even when the pointer leaves it, so no
 * document-level listeners are needed. A tap without exceeding the threshold
 * still produces a native click; after a real drag the click (if any) is
 * left to the caller to suppress.
 */
export function makeDraggable(el: HTMLElement, handlers: DragHandlers): void {
  const threshold = handlers.threshold ?? 0;
  let pointerId = -1;
  let startX = 0;
  let startY = 0;
  let dragging = false;

  el.addEventListener('pointerdown', (e: PointerEvent) => {
    if (!e.isPrimary) {
      return;
    }
    if (handlers.onStart?.(e) === false) {
      return;
    }
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    dragging = false;
    el.setPointerCapture(e.pointerId);
    e.preventDefault();
  });
  el.addEventListener('pointermove', (e: PointerEvent) => {
    if (e.pointerId !== pointerId) {
      return;
    }
    if (!dragging) {
      if (
        Math.abs(e.clientX - startX) < threshold &&
        Math.abs(e.clientY - startY) < threshold
      ) {
        return;
      }
      dragging = true;
    }
    handlers.onMove(e, e.clientX - startX, e.clientY - startY);
  });
  const end = (e: PointerEvent): void => {
    if (e.pointerId !== pointerId) {
      return;
    }
    pointerId = -1;
    const moved = dragging;
    dragging = false;
    handlers.onEnd?.(moved);
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}
