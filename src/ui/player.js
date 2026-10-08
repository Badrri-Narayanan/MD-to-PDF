import { createReader } from '../lib/reader.js';
import { collectBlocks, indexOfBlock } from '../lib/speech-blocks.js';
import { pickVoice, sortVoices } from '../lib/voices.js';
import { initStartHere } from './start-here.js';

/** Read-aloud player. Returns the reader, or null when the browser has no speech synthesis. */
export function initPlayer({ elements, preview, previewScroll, store, toast }) {
  const { player, playBtn, prevBtn, nextBtn, stopBtn, startHereBtn, label, progressBar, voiceSel, rateSel } = elements;
  const synth = window.speechSynthesis;

  if (!synth || !window.SpeechSynthesisUtterance) {
    player.classList.add('unsupported');
    label.textContent = 'Read aloud is not supported in this browser';
    return null;
  }

  let voices = [];
  function loadVoices() {
    const language = navigator.language || 'en';
    voices = sortVoices(synth.getVoices(), language);
    if (!voices.length) return;
    voiceSel.replaceChildren(...voices.map(v => new Option(`${v.name} (${v.lang})`, v.voiceURI)));
    voiceSel.value = pickVoice(voices, { savedURI: store.get('voice'), language }).voiceURI;
  }

  function highlight(el) {
    preview.querySelectorAll('.speaking').forEach(n => n.classList.remove('speaking'));
    if (!el) return;
    el.classList.add('speaking');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function showState({ state, index, total }) {
    const playing = state === 'playing';
    player.classList.toggle('playing', playing);
    playBtn.querySelector('use').setAttribute('href', playing ? '#i-pause' : '#i-play');
    playBtn.setAttribute('aria-label', playing ? 'Pause' : 'Read aloud');
    [prevBtn, nextBtn, stopBtn].forEach(btn => { btn.disabled = state === 'idle'; });

    if (state === 'idle' || !total) {
      label.textContent = 'Listen to this document';
      progressBar.style.width = '0';
      return;
    }
    const verb = state === 'paused' ? 'Paused' : 'Reading';
    label.innerHTML = `${verb}<span class="eq"><i></i><i></i><i></i></span> <span>· block ${index + 1} of ${total}</span>`;
    progressBar.style.width = `${((index + 1) / total) * 100}%`;
  }

  const reader = createReader({
    synth,
    Utterance: window.SpeechSynthesisUtterance,
    getBlocks: () => collectBlocks(preview),
    getOptions: () => ({
      voice: voices.find(v => v.voiceURI === voiceSel.value),
      rate: parseFloat(rateSel.value),
    }),
    onHighlight: highlight,
    onChange: showState,
    onFinish: () => toast('Finished reading'),
  });

  loadVoices();
  synth.addEventListener?.('voiceschanged', loadVoices);
  rateSel.value = store.get('rate') || '1';

  playBtn.addEventListener('click', () => {
    if (!reader.toggle()) toast('Nothing to read yet');
  });
  prevBtn.addEventListener('click', () => reader.skip(-1));
  nextBtn.addEventListener('click', () => reader.skip(1));
  stopBtn.addEventListener('click', () => reader.stop());
  voiceSel.addEventListener('change', () => {
    store.set('voice', voiceSel.value);
    reader.restart();
  });
  rateSel.addEventListener('change', () => {
    store.set('rate', rateSel.value);
    reader.restart();
  });
  preview.addEventListener('dblclick', e => {
    const index = indexOfBlock(collectBlocks(preview), e.target);
    if (index < 0) return;
    window.getSelection()?.removeAllRanges();
    reader.playFrom(index);
  });
  initStartHere({
    button: startHereBtn,
    container: previewScroll,
    preview,
    onStart: index => reader.playFrom(index),
  });
  addEventListener('beforeunload', () => synth.cancel());

  return reader;
}
