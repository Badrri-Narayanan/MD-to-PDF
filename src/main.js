import 'highlight.js/styles/github.css';
import './styles/app.css';
import './styles/document.css';

import { renderMarkdown } from './lib/markdown.js';
import { formatStats } from './lib/stats.js';
import { createStore } from './lib/storage.js';
import { stripMarkdownExtension, toPdfBaseName } from './lib/files.js';
import { exportPdf, printDocument } from './lib/pdf.js';
import { createToast } from './ui/toast.js';
import { initTheme } from './ui/theme.js';
import { initImport } from './ui/importer.js';
import { initPlayer } from './ui/player.js';
import SAMPLE from './sample.md?raw';

const RENDER_DEBOUNCE_MS = 120;

const $ = id => document.getElementById(id);
const editor = $('editor');
const preview = $('preview');
const fileNameInput = $('fileName');
const fontSel = $('fontSel');
const pageSel = $('pageSel');
const downloadBtn = $('downloadBtn');

const store = createStore('md2pdf.');
const toast = createToast($('toast'));
const pageStyle = document.head.appendChild(document.createElement('style'));

const reader = initPlayer({
  elements: {
    player: $('player'),
    playBtn: $('playBtn'),
    prevBtn: $('prevBtn'),
    nextBtn: $('nextBtn'),
    stopBtn: $('stopBtn'),
    startHereBtn: $('startHereBtn'),
    label: $('playerLabel'),
    progressBar: $('progressBar'),
    voiceSel: $('voiceSel'),
    rateSel: $('rateSel'),
  },
  preview,
  previewScroll: $('previewScroll'),
  store,
  toast,
});

function render() {
  if (reader && reader.state !== 'idle') reader.stop();
  preview.innerHTML = renderMarkdown(editor.value);
  $('stats').textContent = formatStats(editor.value);
  store.set('content', editor.value);
}

let renderTimer;
editor.addEventListener('input', () => {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(render, RENDER_DEBOUNCE_MS);
});

// Tab inserts two spaces instead of moving focus out of the editor
editor.addEventListener('keydown', e => {
  if (e.key !== 'Tab') return;
  e.preventDefault();
  editor.setRangeText('  ', editor.selectionStart, editor.selectionEnd, 'end');
  editor.dispatchEvent(new Event('input'));
});

function applyFont() {
  preview.classList.toggle('sans', fontSel.value === 'sans');
  store.set('font', fontSel.value);
}

function applyPageSize() {
  pageStyle.textContent = `@page { size: ${pageSel.value}; }`;
  store.set('page', pageSel.value);
}

fontSel.addEventListener('change', applyFont);
pageSel.addEventListener('change', applyPageSize);

document.querySelectorAll('.tab').forEach(tab => tab.addEventListener('click', () => {
  document.body.dataset.view = tab.dataset.view;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
}));

const importer = initImport({
  button: $('importBtn'),
  input: $('fileInput'),
  onImport(text, file) {
    editor.value = text;
    fileNameInput.value = stripMarkdownExtension(file.name);
    render();
    toast(`Imported ${file.name}`);
  },
  onReject: file => toast(`"${file.name}" doesn't look like a Markdown file`),
});

async function downloadPdf() {
  if (downloadBtn.disabled) return;
  const fileName = toPdfBaseName(fileNameInput.value);
  const idleContent = downloadBtn.innerHTML;
  downloadBtn.disabled = true;
  downloadBtn.innerHTML = '<span class="spinner"></span><span class="label">Generating…</span>';
  try {
    await exportPdf(preview, { fileName, pageSize: pageSel.value });
    toast(`Downloaded ${fileName}.pdf`);
  } catch (err) {
    console.error(err);
    toast('Could not generate the PDF. Try Print instead.');
  } finally {
    downloadBtn.disabled = false;
    downloadBtn.innerHTML = idleContent;
  }
}

downloadBtn.addEventListener('click', downloadPdf);
$('printBtn').addEventListener('click', () => printDocument(toPdfBaseName(fileNameInput.value)));

document.addEventListener('keydown', e => {
  if (!(e.metaKey || e.ctrlKey)) return;
  const key = e.key.toLowerCase();
  if (key === 's') {
    e.preventDefault();
    downloadPdf();
  } else if (key === 'o') {
    e.preventDefault();
    importer.open();
  }
});

initTheme({ button: $('themeBtn'), store });
editor.value = store.get('content') ?? SAMPLE;
fontSel.value = store.get('font') || 'serif';
pageSel.value = store.get('page') || 'A4';
applyFont();
applyPageSize();
render();
