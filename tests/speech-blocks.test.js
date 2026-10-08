import { describe, expect, it } from 'vitest';
import { collectBlocks, indexOfBlock } from '../src/lib/speech-blocks.js';

function dom(html) {
  const root = document.createElement('article');
  root.innerHTML = html;
  return root;
}

describe('collectBlocks', () => {
  it('returns headings, paragraphs and table cells in reading order', () => {
    const root = dom('<h1>Title</h1><p>Intro   text</p><table><tr><th>H</th><td>D</td></tr></table>');
    expect(collectBlocks(root).map(b => b.text)).toEqual(['Title', 'Intro text', 'H', 'D']);
  });

  it('skips code blocks and empty elements', () => {
    const root = dom('<p>Before</p><pre><code>x = 1</code></pre><p>  </p><p>After</p>');
    expect(collectBlocks(root).map(b => b.text)).toEqual(['Before', 'After']);
  });

  it('reads a list item without repeating its nested list', () => {
    const root = dom('<ul><li>Parent<ul><li>Child</li></ul></li></ul>');
    expect(collectBlocks(root).map(b => b.text)).toEqual(['Parent', 'Child']);
  });

  it('reads paragraphs inside loose list items once', () => {
    const root = dom('<ul><li><p>First</p></li><li><p>Second</p></li></ul>');
    expect(collectBlocks(root).map(b => b.text)).toEqual(['First', 'Second']);
  });
});

describe('indexOfBlock', () => {
  it('finds the block containing a clicked inline element', () => {
    const root = dom('<h1>Title</h1><p>Some <strong>bold</strong> text</p>');
    const blocks = collectBlocks(root);
    expect(indexOfBlock(blocks, root.querySelector('strong'))).toBe(1);
  });

  it('returns -1 when the click is outside any readable block', () => {
    const root = dom('<p>Text</p><pre><code>code</code></pre>');
    expect(indexOfBlock(collectBlocks(root), root.querySelector('code'))).toBe(-1);
  });
});
