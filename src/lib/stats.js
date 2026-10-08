export const WORDS_PER_MINUTE = 200;

export function countWords(text) {
  return (text.match(/\S+/g) || []).length;
}

export function readingMinutes(words) {
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function formatStats(text) {
  const words = countWords(text);
  return `${words.toLocaleString()} words · ${readingMinutes(words)} min read`;
}
