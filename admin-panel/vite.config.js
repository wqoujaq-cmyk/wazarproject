import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html',
      },
      // Don't bundle external Firebase CDN imports
      external: [
        /^https:\/\/www\.gstatic\.com/,
      ],
    },
  },
  server: {
    port: 3000,
  },
});

