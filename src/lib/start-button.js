const GAP_PX = 8;

/**
 * Where to put the "read from here" button for a block, in the scroll container's
 * content coordinates: in the gutter left of the document's text column (so it
 * never covers text, e.g. in a table's second column), centred on the block's
 * first line, and never past the container's left edge.
 */
export function startButtonPosition({ blockRect, contentLeft, containerRect, scrollTop, scrollLeft = 0, lineHeight, size }) {
  const firstLine = Number.isFinite(lineHeight) ? Math.min(lineHeight, blockRect.height) : size;
  return {
    top: blockRect.top - containerRect.top + scrollTop + (firstLine - size) / 2,
    left: Math.max(0, contentLeft - containerRect.left + scrollLeft - size - GAP_PX),
  };
}
