import { defineConfig } from 'vitest/config';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
  base: './',
  // Inline all JS and CSS into dist/index.html so the build opens straight from disk
  plugins: [viteSingleFile()],
  test: {
    environment: 'jsdom',
    include: ['tests/**/*.test.js'],
  },
});
