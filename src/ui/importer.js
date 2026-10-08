import { isMarkdownFile } from '../lib/files.js';

/** Wires the import button, file picker and page-wide drag & drop. */
export function initImport({ button, input, onImport, onReject }) {
  async function handle(file) {
    if (!file) return;
    if (!isMarkdownFile(file)) {
      onReject(file);
      return;
    }
    onImport(await file.text(), file);
  }

  button.addEventListener('click', () => input.click());
  input.addEventListener('change', () => {
    handle(input.files[0]);
    input.value = '';
  });

  // dragenter/dragleave fire for every child element, so count depth to know when the drag leaves the page
  let dragDepth = 0;
  const endDrag = () => {
    dragDepth = 0;
    document.body.classList.remove('dragging');
  };
  document.addEventListener('dragenter', e => {
    if (!e.dataTransfer.types.includes('Files')) return;
    dragDepth++;
    document.body.classList.add('dragging');
  });
  document.addEventListener('dragleave', () => {
    if (--dragDepth <= 0) endDrag();
  });
  document.addEventListener('dragover', e => e.preventDefault());
  document.addEventListener('drop', e => {
    e.preventDefault();
    endDrag();
    handle(e.dataTransfer.files[0]);
  });

  return { open: () => input.click() };
}
