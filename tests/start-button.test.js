import { describe, expect, it } from 'vitest';
import { startButtonPosition } from '../src/lib/start-button.js';

const containerRect = { top: 100, left: 50 };

describe('startButtonPosition', () => {
  it('sits in the gutter left of the text column, centred on the first line', () => {
    const position = startButtonPosition({
      blockRect: { top: 300, height: 90 },
      contentLeft: 200,
      containerRect,
      scrollTop: 0,
      lineHeight: 30,
      size: 28,
    });
    expect(position).toEqual({ top: 201, left: 114 });
  });

  it('accounts for the container being scrolled', () => {
    const position = startButtonPosition({
      blockRect: { top: 300, height: 30 },
      contentLeft: 200,
      containerRect,
      scrollTop: 500,
      scrollLeft: 10,
      lineHeight: 30,
      size: 28,
    });
    expect(position).toEqual({ top: 701, left: 124 });
  });

  it('never goes past the left edge of the container', () => {
    const position = startButtonPosition({
      blockRect: { top: 100, height: 20 },
      contentLeft: 60,
      containerRect,
      scrollTop: 0,
      lineHeight: 20,
      size: 28,
    });
    expect(position.left).toBe(0);
  });

  it('aligns with the top of the block when line-height is unknown ("normal")', () => {
    const position = startButtonPosition({
      blockRect: { top: 100, height: 20 },
      contentLeft: 200,
      containerRect,
      scrollTop: 0,
      lineHeight: NaN,
      size: 28,
    });
    expect(position.top).toBe(0);
  });
});
