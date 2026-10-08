import { describe, expect, it } from 'vitest';
import { createStore } from '../src/lib/storage.js';

function memoryBackend() {
  const data = new Map();
  return {
    getItem: key => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
    data,
  };
}

describe('createStore', () => {
  it('reads and writes prefixed keys', () => {
    const backend = memoryBackend();
    const store = createStore('app.', () => backend);
    store.set('theme', 'dark');
    expect(backend.data.get('app.theme')).toBe('dark');
    expect(store.get('theme')).toBe('dark');
  });

  it('returns null for missing keys', () => {
    expect(createStore('app.', memoryBackend).get('nope')).toBeNull();
  });

  it('swallows errors when storage is unavailable', () => {
    const store = createStore('app.', () => { throw new Error('SecurityError'); });
    expect(() => store.set('theme', 'dark')).not.toThrow();
    expect(store.get('theme')).toBeNull();
  });

  it('uses localStorage by default', () => {
    createStore('test.').set('k', 'v');
    expect(localStorage.getItem('test.k')).toBe('v');
  });
});
