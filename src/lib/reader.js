/**
 * Reads blocks of text aloud one at a time through the Web Speech API.
 *
 * Speaking block by block (rather than one huge utterance) lets the UI highlight
 * the current block, and avoids Chrome cutting off long utterances.
 * Every playFrom/stop starts a new session so callbacks from cancelled
 * utterances are ignored.
 */
export function createReader({
  synth,
  Utterance,
  getBlocks,
  getOptions = () => ({}),
  onHighlight = () => {},
  onChange = () => {},
  onFinish = () => {},
  // Chrome drops an utterance queued in the same tick as cancel()
  schedule = fn => setTimeout(fn, 60),
}) {
  let state = 'idle'; // idle | playing | paused
  let blocks = [];
  let index = 0;
  let session = 0;

  const snapshot = () => ({ state, index, total: blocks.length });

  function setState(next) {
    state = next;
    onChange(snapshot());
  }

  function speakCurrent(token) {
    if (token !== session) return;
    if (index >= blocks.length) {
      stop();
      onFinish();
      return;
    }
    const { el, text } = blocks[index];
    onHighlight(el);

    const utterance = new Utterance(text);
    const { voice, rate } = getOptions();
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    if (rate) utterance.rate = rate;

    const advance = () => {
      if (token !== session) return;
      index++;
      speakCurrent(token);
    };
    utterance.onend = advance;
    utterance.onerror = e => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') advance();
    };
    synth.speak(utterance);
    onChange(snapshot());
  }

  /** Starts reading at the given block. Returns false when there is nothing to read. */
  function playFrom(start) {
    blocks = getBlocks();
    if (!blocks.length) return false;
    const token = ++session;
    synth.cancel();
    index = Math.min(Math.max(start, 0), blocks.length - 1);
    setState('playing');
    schedule(() => speakCurrent(token));
    return true;
  }

  function toggle() {
    if (state === 'playing') {
      synth.pause();
      setState('paused');
      return true;
    }
    if (state === 'paused') {
      synth.resume();
      setState('playing');
      return true;
    }
    return playFrom(0);
  }

  function stop() {
    session++;
    synth.cancel();
    index = 0;
    onHighlight(null);
    setState('idle');
  }

  /** Re-speaks the current block, e.g. after the voice or speed changed. */
  function restart() {
    if (state !== 'idle') playFrom(index);
  }

  /** Jumps by `offset` blocks and keeps reading, even if paused. Returns false when idle. */
  function skip(offset) {
    if (state === 'idle') return false;
    const target = index + offset;
    if (target >= blocks.length) {
      stop();
      onFinish();
      return true;
    }
    return playFrom(target);
  }

  return {
    playFrom,
    toggle,
    stop,
    restart,
    skip,
    get state() { return state; },
    get index() { return index; },
    get total() { return blocks.length; },
  };
}
