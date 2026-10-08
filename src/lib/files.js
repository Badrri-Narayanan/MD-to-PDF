const MARKDOWN_EXTENSION = /\.(md|markdown|mdown|txt)$/i;
const ILLEGAL_FILENAME_CHARS = /[\\/:*?"<>|]/g;

export function isMarkdownFile(file) {
  return MARKDOWN_EXTENSION.test(file.name) || file.type.startsWith('text/');
}

export function stripMarkdownExtension(name) {
  return name.replace(MARKDOWN_EXTENSION, '');
}

/** Turns whatever the user typed into a safe PDF base name (without extension). */
export function toPdfBaseName(input) {
  const name = input.trim().replace(/\.pdf$/i, '').replace(ILLEGAL_FILENAME_CHARS, '-');
  return name || 'document';
}
