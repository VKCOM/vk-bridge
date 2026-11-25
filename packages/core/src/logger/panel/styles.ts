/// <reference lib="dom" />

export const PREFIX = 'vk-bridge-log';

const STYLE_ID = `${PREFIX}-style`;

/**
 * Injects the panel stylesheet once per document.
 */
export function ensureStyles(): void {
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
