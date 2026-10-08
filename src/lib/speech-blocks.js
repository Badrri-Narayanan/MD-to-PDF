export const READABLE_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,li,th,td';

/** The text to speak for one block. List items read only their own text; nested lists and paragraphs are separate blocks. */
export function blockText(el) {
  const clone = el.cloneNode(true);
  if (el.tagName === 'LI') clone.querySelectorAll('ul,ol,p').forEach(n => n.remove());
  return clone.textContent.replace(/\s+/g, ' ').trim();
}

/** Splits rendered document into speakable blocks, in reading order. Code blocks are skipped. */
export function collectBlocks(root) {
  return [...root.querySelectorAll(READABLE_SELECTOR)]
    .map(el => ({ el, text: blockText(el) }))
    .filter(block => block.text);
}

/** Index of the block containing (or contained by) the clicked node, or -1. */
export function indexOfBlock(blocks, target) {
  const block = target.closest?.(READABLE_SELECTOR);
  if (!block) return -1;
  return blocks.findIndex(b => b.el === block || b.el.contains(block) || block.contains(b.el));
}
