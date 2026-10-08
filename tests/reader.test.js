import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createReader } from '../src/lib/reader.js';

class FakeUtterance {
  constructor(text) {
    this.text = text;
  }
}

function fakeSynth() {
  return {
    spoken: [],
    speak: vi.fn(function (u) { this.spoken.push(u); }),
    cancel: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    get last() { return this.spoken.at(-1); },
  };
}

const blocks = ['One', 'Two', 'Three'].map(text => ({ el: { text }, text }));

describe('createReader', () => {
  let synth;
  let changes;
  let highlights;
  let onFinish;
  let reader;

  beforeEach(() => {
    synth = fakeSynth();
    changes = [];
    highlights = [];
    onFinish = vi.fn();
    reader = createReader({
      synth,
      Utterance: FakeUtterance,
      getBlocks: () => blocks,
      getOptions: () => ({ rate: 1.5, voice: { lang: 'en-GB' } }),
      onHighlight: el => highlights.push(el?.text ?? null),
      onChange: s => changes.push(s),
      onFinish,
      schedule: fn => fn(),
    });
  });

  it('reads blocks in order, highlighting each one', () => {
    reader.toggle();
    expect(synth.last.text).toBe('One');
    synth.last.onend();
    expect(synth.last.text).toBe('Two');
    expect(highlights).toEqual(['One', 'Two']);
    expect(changes.at(-1)).toEqual({ state: 'playing', index: 1, total: 3 });
  });

  it('applies the voice and rate options', () => {
    reader.toggle();
    expect(synth.last.rate).toBe(1.5);
    expect(synth.last.lang).toBe('en-GB');
  });

  it('finishes after the last block', () => {
    reader.playFrom(2);
    synth.last.onend();
    expect(reader.state).toBe('idle');
    expect(onFinish).toHaveBeenCalledOnce();
    expect(highlights.at(-1)).toBeNull();
  });

  it('pauses and resumes', () => {
    reader.toggle();
    reader.toggle();
    expect(synth.pause).toHaveBeenCalled();
    expect(reader.state).toBe('paused');
    reader.toggle();
    expect(synth.resume).toHaveBeenCalled();
    expect(reader.state).toBe('playing');
  });

  it('ignores callbacks from utterances cancelled by stop', () => {
    reader.toggle();
    const stale = synth.last;
    reader.stop();
    stale.onend();
    expect(synth.speak).toHaveBeenCalledOnce();
    expect(reader.state).toBe('idle');
  });

  it('skips a block that errors, but not one that was interrupted', () => {
    reader.toggle();
    synth.last.onerror({ error: 'interrupted' });
    expect(synth.speak).toHaveBeenCalledOnce();
    synth.last.onerror({ error: 'synthesis-failed' });
    expect(synth.last.text).toBe('Two');
  });

  it('clamps the start index', () => {
    reader.playFrom(99);
    expect(synth.last.text).toBe('Three');
  });

  it('restarts the current block when settings change', () => {
    reader.playFrom(1);
    reader.restart();
    expect(synth.spoken.map(u => u.text)).toEqual(['Two', 'Two']);
  });

  describe('skip', () => {
    it('moves to the next and previous block', () => {
      reader.toggle();
      reader.skip(1);
      expect(synth.last.text).toBe('Two');
      reader.skip(-1);
      expect(synth.last.text).toBe('One');
      expect(highlights.at(-1)).toBe('One');
    });

    it('cancels the current utterance so its end event is ignored', () => {
      reader.toggle();
      const skipped = synth.last;
      reader.skip(1);
      skipped.onend();
      expect(synth.spoken.map(u => u.text)).toEqual(['One', 'Two']);
    });

    it('restarts the first block when going back from the start', () => {
      reader.toggle();
      reader.skip(-1);
      expect(synth.spoken.map(u => u.text)).toEqual(['One', 'One']);
    });

    it('finishes when skipping past the last block', () => {
      reader.playFrom(2);
      reader.skip(1);
      expect(reader.state).toBe('idle');
      expect(onFinish).toHaveBeenCalledOnce();
    });

    it('resumes playing when skipping while paused', () => {
      reader.toggle();
      reader.toggle();
      reader.skip(1);
      expect(reader.state).toBe('playing');
      expect(synth.last.text).toBe('Two');
    });

    it('does nothing when idle', () => {
      expect(reader.skip(1)).toBe(false);
      expect(synth.speak).not.toHaveBeenCalled();
    });
  });

  it('reports false when there is nothing to read', () => {
    const empty = createReader({ synth, Utterance: FakeUtterance, getBlocks: () => [], schedule: fn => fn() });
    expect(empty.toggle()).toBe(false);
    expect(synth.speak).not.toHaveBeenCalled();
  });
});
