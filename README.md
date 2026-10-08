# Markdown → PDF

**Live:** https://badrri-narayanan.github.io/MD-to-PDF/

Write or import Markdown, preview it as a page, download it as a PDF, and listen to it read aloud.
Everything runs in the browser; nothing is uploaded.

## Features

- **Live preview** of GitHub-flavoured Markdown: tables, task lists, strikethrough, syntax-highlighted code
- **Import** `.md` / `.markdown` / `.txt` files with the button, <kbd>⌘/Ctrl</kbd>+<kbd>O</kbd>, or drag & drop
- **Download PDF** (<kbd>⌘/Ctrl</kbd>+<kbd>S</kbd>) straight to a file, or **Print** for a PDF with selectable text
- **Read aloud** with the browser's speech engine: voice and speed controls, highlights the current block,
  double-click any paragraph to start from there
- Serif or sans document font, A4 or Letter pages, light and dark themes
- Content and settings are remembered between visits

Force a page break with `<div class="page-break"></div>`.

## Getting started

Requires Node.js 22.22+ or 24.15+.

```sh
npm install
npm run dev      # http://localhost:5173
```

| Command              | What it does                                           |
|----------------------|--------------------------------------------------------|
| `npm run dev`        | Dev server with hot reload                             |
| `npm test`           | Run the unit tests once                                |
| `npm run test:watch` | Re-run tests on change                                 |
| `npm run build`      | Build to `dist/index.html`                             |
| `npm run preview`    | Serve the production build                             |

The build inlines all JavaScript and CSS into a single `dist/index.html`, so you can open it
directly from disk or host it anywhere static. Fonts load from Google Fonts and fall back to
system fonts offline.

## Deployment

Every push to `main` runs the tests, builds, and deploys `dist/` to GitHub Pages
(`.github/workflows/ci.yml`). Pull requests run the tests and build without deploying.
The repo's **Settings → Pages → Source** must be set to **GitHub Actions**.

## Project structure

```
index.html             Page markup and icon sprite
src/
  main.js              Entry point: wires the editor, preview and toolbar together
  sample.md            Document shown on first visit
  lib/                 Logic with no knowledge of the page layout (unit tested)
    markdown.js        Markdown → sanitized, highlighted HTML
    pdf.js             PDF export (html2pdf.js, loaded on demand) and print
    reader.js          Read-aloud state machine over the Web Speech API
    speech-blocks.js   Splits the rendered document into speakable blocks
    voices.js          Voice ordering and default selection
    files.js           File type checks and PDF file naming
    stats.js           Word count and reading time
    storage.js         localStorage wrapper that never throws
  ui/                  DOM wiring for each part of the page
    player.js          Read-aloud player controls
    importer.js        Import button and drag & drop
    theme.js           Light/dark toggle
    toast.js           Notifications
  styles/
    app.css            Application chrome
    document.css       Document styles shared by preview, PDF and print
tests/                 Vitest + jsdom tests for src/lib
```

## Limitations

- **Download PDF** renders the page to images (via html2canvas), so text in that PDF isn't selectable.
  Use **Print → Save as PDF** when you need selectable, searchable text.
- **Read aloud** plays through the browser and can't be saved as an audio file. That would need a
  cloud text-to-speech service. Available voices depend on the browser and operating system.
