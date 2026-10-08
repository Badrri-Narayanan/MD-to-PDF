import { describe, expect, it } from 'vitest';
import { pickVoice, sortVoices } from '../src/lib/voices.js';

const voice = (name, lang, extra = {}) => ({ name, lang, voiceURI: `uri:${name}`, default: false, ...extra });
const voices = [
  voice('Thomas', 'fr-FR'),
  voice('Samantha', 'en-US'),
  voice('Daniel', 'en-GB', { default: true }),
  voice('Anna', 'de-DE'),
];

describe('sortVoices', () => {
  it('puts voices for the user language first, then sorts by name', () => {
    expect(sortVoices(voices, 'en-US').map(v => v.name)).toEqual(['Daniel', 'Samantha', 'Anna', 'Thomas']);
  });

  it('does not mutate the input', () => {
    const copy = [...voices];
    sortVoices(voices, 'en');
    expect(voices).toEqual(copy);
  });
});

describe('pickVoice', () => {
  const sorted = sortVoices(voices, 'en-US');

  it('prefers the saved voice', () => {
    expect(pickVoice(sorted, { savedURI: 'uri:Anna', language: 'en-US' }).name).toBe('Anna');
  });

  it('falls back to the default voice for the language', () => {
    expect(pickVoice(sorted, { savedURI: 'uri:gone', language: 'en-US' }).name).toBe('Daniel');
  });

  it('falls back to the first voice, or null when there are none', () => {
    expect(pickVoice(sorted, { savedURI: null, language: 'ja-JP' }).name).toBe('Daniel');
    expect(pickVoice([], { savedURI: null, language: 'en' })).toBeNull();
  });
});
