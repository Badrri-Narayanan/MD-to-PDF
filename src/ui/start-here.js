import { collectBlocks, indexOfBlock } from '../lib/speech-blocks.js';
import { startButtonPosition } from '../lib/start-button.js';

/**
 * Shows a "read from here" button beside the block under the pointer (or the
 * tapped block on touch screens) and calls onStart with that block's index.
 */
export function initStartHere({ button, container, preview, onStart }) {
  let blocks = null;
  let targetIndex = -1;

  const hide = () => {
    button.hidden = true;
    targetIndex = -1;
  };

  function showFor(node) {
    blocks ??= collectBlocks(preview);
    const index = indexOfBlock(blocks, node);
    if (index < 0) {
      hide();
      return;
    }
    if (index === targetIndex && !button.hidden) return;

    const block = blocks[index].el;
    const { top, left } = startButtonPosition({
      blockRect: block.getBoundingClientRect(),
      contentLeft: preview.getBoundingClientRect().left + parseFloat(getComputedStyle(preview).paddingLeft),
      containerRect: container.getBoundingClientRect(),
      scrollTop: container.scrollTop,
      scrollLeft: container.scrollLeft,
      lineHeight: parseFloat(getComputedStyle(block).lineHeight),
      size: button.offsetWidth || 28,
    });
    button.style.top = `${top}px`;
    button.style.left = `${left}px`;
    button.hidden = false;
    targetIndex = index;
  }

  preview.addEventListener('mouseover', e => showFor(e.target));
  preview.addEventListener('click', e => showFor(e.target));
  container.addEventListener('mouseleave', hide);
  button.addEventListener('click', () => {
    if (targetIndex >= 0) onStart(targetIndex);
  });

  // Re-rendering replaces every block, so cached blocks and the button position go stale
  new MutationObserver(() => {
    blocks = null;
    hide();
  }).observe(preview, { childList: true });
}
