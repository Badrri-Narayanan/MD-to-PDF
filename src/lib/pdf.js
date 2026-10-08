const PAGE_WIDTH_MM = { A4: 210, Letter: 215.9 };
const MARGIN_MM = { vertical: 16, horizontal: 15 };
const MM_PER_INCH = 25.4;
const CSS_PX_PER_INCH = 96;

/** Width of the printable area in CSS px, so the PDF wraps lines like a real page. */
export function contentWidthPx(pageSize) {
  const pageWidth = PAGE_WIDTH_MM[pageSize];
  if (!pageWidth) throw new Error(`Unknown page size: ${pageSize}`);
  return ((pageWidth - 2 * MARGIN_MM.horizontal) / MM_PER_INCH) * CSS_PX_PER_INCH;
}

export function pdfOptions({ fileName, pageSize }) {
  const { vertical, horizontal } = MARGIN_MM;
  return {
    margin: [vertical, horizontal, vertical, horizontal],
    filename: `${fileName}.pdf`,
    image: { type: 'jpeg', quality: 0.96 },
    html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff' },
    jsPDF: { unit: 'mm', format: pageSize.toLowerCase(), orientation: 'portrait' },
    pagebreak: { mode: ['css', 'legacy'], avoid: ['pre', 'table', 'img', 'blockquote', 'tr'] },
  };
}

/** A detached copy of the preview, sized to the page and without on-screen decoration. */
export function createPdfSource(preview, pageSize) {
  const source = document.createElement('div');
  source.className = [...preview.classList].filter(c => c !== 'paper').join(' ');
  source.innerHTML = preview.innerHTML;
  source.querySelectorAll('.speaking').forEach(el => el.classList.remove('speaking'));
  Object.assign(source.style, {
    width: `${contentWidthPx(pageSize)}px`,
    background: '#fff',
    color: '#1f2328',
    padding: '0',
  });
  return source;
}

/** Renders the preview to a PDF and downloads it. The library is loaded on first use. */
export async function exportPdf(preview, { fileName, pageSize }) {
  const { default: html2pdf } = await import('html2pdf.js');
  await document.fonts?.ready;
  await html2pdf()
    .set(pdfOptions({ fileName, pageSize }))
    .from(createPdfSource(preview, pageSize))
    .save();
}

/** Opens the print dialog; it uses document.title as the default PDF file name. */
export function printDocument(fileName) {
  const original = document.title;
  document.title = fileName;
  window.print();
  document.title = original;
}
