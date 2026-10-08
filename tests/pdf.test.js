import { describe, expect, it, vi } from 'vitest';
import { contentWidthPx, createPdfSource, exportPdf, pdfOptions } from '../src/lib/pdf.js';

const worker = {
  set: vi.fn(() => worker),
  from: vi.fn(() => worker),
  save: vi.fn(() => Promise.resolve()),
};
vi.mock('html2pdf.js', () => ({ default: () => worker }));

function previewElement() {
  const preview = document.createElement('article');
  preview.className = 'doc paper sans';
  preview.innerHTML = '<h1>Title</h1><p class="speaking">Being read</p>';
  return preview;
}

describe('contentWidthPx', () => {
  it('is the page width minus 15mm margins, in CSS px', () => {
    expect(contentWidthPx('A4')).toBeCloseTo(680.3, 1);
    expect(contentWidthPx('Letter')).toBeCloseTo(702.6, 1);
  });

  it('rejects unknown page sizes', () => {
    expect(() => contentWidthPx('A3')).toThrow('Unknown page size: A3');
  });
});

describe('pdfOptions', () => {
  it('sets the file name and page format', () => {
    const options = pdfOptions({ fileName: 'report', pageSize: 'Letter' });
    expect(options.filename).toBe('report.pdf');
    expect(options.jsPDF).toMatchObject({ unit: 'mm', format: 'letter' });
  });
});

describe('createPdfSource', () => {
  it('copies the content without on-screen decoration', () => {
    const preview = previewElement();
    const source = createPdfSource(preview, 'A4');
    expect(source.className).toBe('doc sans');
    expect(source.querySelector('h1').textContent).toBe('Title');
    expect(source.querySelector('.speaking')).toBeNull();
    expect(source.style.width).toBe(`${contentWidthPx('A4')}px`);
  });

  it('leaves the preview untouched', () => {
    const preview = previewElement();
    createPdfSource(preview, 'A4');
    expect(preview.querySelector('.speaking')).not.toBeNull();
  });
});

describe('exportPdf', () => {
  it('renders the preview with html2pdf and saves it', async () => {
    await exportPdf(previewElement(), { fileName: 'notes', pageSize: 'A4' });
    expect(worker.set).toHaveBeenCalledWith(expect.objectContaining({ filename: 'notes.pdf' }));
    expect(worker.from.mock.calls[0][0].querySelector('h1').textContent).toBe('Title');
    expect(worker.save).toHaveBeenCalled();
  });
});
