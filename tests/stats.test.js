import { describe, expect, it } from 'vitest';
import { countWords, formatStats, readingMinutes } from '../src/lib/stats.js';

describe('countWords', () => {
  it('counts whitespace-separated words', () => {
    expect(countWords('one two\nthree\t four')).toBe(4);
  });

  it('returns 0 for empty or blank text', () => {
    expect(countWords('')).toBe(0);
    expect(countWords('   \n ')).toBe(0);
  });
});

describe('readingMinutes', () => {
  it('rounds to the nearest minute at 200 words per minute', () => {
    expect(readingMinutes(200)).toBe(1);
    expect(readingMinutes(500)).toBe(3);
  });

  it('never reports less than one minute', () => {
    expect(readingMinutes(0)).toBe(1);
  });
});

describe('formatStats', () => {
  it('combines word count and reading time', () => {
    expect(formatStats('a b c')).toBe('3 words · 1 min read');
  });
});
