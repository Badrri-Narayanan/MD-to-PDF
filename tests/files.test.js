import { describe, expect, it } from 'vitest';
import { isMarkdownFile, stripMarkdownExtension, toPdfBaseName } from '../src/lib/files.js';

const file = (name, type = '') => ({ name, type });

describe('isMarkdownFile', () => {
  it.each(['notes.md', 'README.MD', 'doc.markdown', 'a.mdown', 'plain.txt'])('accepts %s', name => {
    expect(isMarkdownFile(file(name))).toBe(true);
  });

  it('accepts any text/* file regardless of extension', () => {
    expect(isMarkdownFile(file('notes', 'text/plain'))).toBe(true);
  });

  it('rejects binary files', () => {
    expect(isMarkdownFile(file('photo.png', 'image/png'))).toBe(false);
  });
});

describe('stripMarkdownExtension', () => {
  it('removes a Markdown extension only', () => {
    expect(stripMarkdownExtension('my.notes.md')).toBe('my.notes');
    expect(stripMarkdownExtension('report.pdf')).toBe('report.pdf');
  });
});

describe('toPdfBaseName', () => {
  it('trims whitespace and a trailing .pdf', () => {
    expect(toPdfBaseName('  Report.PDF ')).toBe('Report');
  });

  it('replaces characters that are illegal in file names', () => {
    expect(toPdfBaseName('a/b:c*d?')).toBe('a-b-c-d-');
  });

  it('falls back to "document" when empty', () => {
    expect(toPdfBaseName('   ')).toBe('document');
    expect(toPdfBaseName('.pdf')).toBe('document');
  });
});
