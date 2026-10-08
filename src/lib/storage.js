/**
 * localStorage wrapper that never throws: storage can be missing or blocked
 * (private windows, disabled site data), and settings simply won't persist then.
 */
export function createStore(prefix, getBackend = () => globalThis.localStorage) {
  return {
    get(key) {
      try {
        return getBackend().getItem(prefix + key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        getBackend().setItem(prefix + key, value);
      } catch {
        // Storage unavailable; the value just isn't remembered.
      }
    },
  };
}
