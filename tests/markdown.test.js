import { describe, expect, it } from 'vitest';
import { renderMarkdown } from '../src/lib/markdown.js';

function render(md) {
  const div = document.createElement('div');
  div.innerHTML = renderMarkdown(md);
  return div;
}

describe('renderMarkdown', () => {
  it('renders headings and inline formatting', () => {
    const doc = render('# Title\n\nSome **bold** and *italic* text.');
    expect(doc.querySelector('h1').textContent).toBe('Title');
    expect(doc.querySelector('strong').textContent).toBe('bold');
    expect(doc.querySelector('em').textContent).toBe('italic');
  });

  it('supports GFM tables with column alignment', () => {
    const doc = render('| A | B |\n|---|:-:|\n| 1 | 2 |');
    expect(doc.querySelectorAll('td')).toHaveLength(2);
    expect(doc.querySelector('th[align="center"]').textContent).toBe('B');
  });

  it('supports task lists and strikethrough', () => {
    const doc = render('- [x] done\n- [ ] todo\n\n~~gone~~');
    const boxes = doc.querySelectorAll('input[type=checkbox]');
    expect([...boxes].map(b => b.checked)).toEqual([true, false]);
    expect(doc.querySelector('del').textContent).toBe('gone');
  });

  it('strips scripts and inline event handlers', () => {
    const doc = render('<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)">');
    expect(doc.querySelector('script')).toBeNull();
    expect(doc.querySelector('img').hasAttribute('onerror')).toBe(false);
  });

  it('removes javascript: links', () => {
    const doc = render('[click](javascript:alert(1))');
    expect(doc.querySelector('a').getAttribute('href')).toBeNull();
  });

  it('syntax-highlights fenced code blocks', () => {
    const doc = render('```js\nconst x = 1;\n```');
    const code = doc.querySelector('pre code');
    expect(code.classList.contains('hljs')).toBe(true);
    expect(code.querySelector('.hljs-keyword').textContent).toBe('const');
  });

  it('opens external links in a new tab', () => {
    const doc = render('[ext](https://example.com) and [local](#section)');
    const [ext, local] = doc.querySelectorAll('a');
    expect(ext.target).toBe('_blank');
    expect(ext.rel).toBe('noopener');
    expect(local.hasAttribute('target')).toBe(false);
  });
});
