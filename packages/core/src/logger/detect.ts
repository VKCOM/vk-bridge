/**
 * Checks whether the bridge logger should be enabled.
 *
 * Activation sources (any one is enough):
 * - `localStorage['vk-bridge-log'] === '1'` — persists across reloads;
 *   convenient for QA in webviews (set once via a remote debugger).
 * - `vk_log=1` in `location.hash` or `location.search`.
 *
 * Safe to call in non-browser environments (returns false).
 */
export function isLogEnabled(): boolean {
  try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('vk-bridge-log') === '1') {
      return true;
    }
    if (typeof location !== 'undefined') {
      const hash = new URLSearchParams(location.hash.replace(/^#/, ''));
      if (hash.get('vk_log') === '1') {
        return true;
      }
      const search = new URLSearchParams(location.search);
      if (search.get('vk_log') === '1') {
        return true;
      }
    }
  } catch {
    // ignore — treat as disabled
  }
  return false;
}
