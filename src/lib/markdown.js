import { Marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js/lib/common';

const marked = new Marked({ gfm: true, breaks: false });

/** Converts Markdown to sanitized, syntax-highlighted HTML. */
export function renderMarkdown(source) {
  const template = document.createElement('template');
  template.innerHTML = DOMPurify.sanitize(marked.parse(source));
  const content = template.content;
  content.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
  content.querySelectorAll('a[href^="http"]').forEach(a => {
    a.target = '_blank';
    a.rel = 'noopener';
  });
  return template.innerHTML;
}
