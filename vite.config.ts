import { resolve } from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '$': resolve(__dirname),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'plausible/lib/index.ts'),
      name: 'PlausibleTracker',
      fileName: 'plausible-tracker',
      formats: ['es', 'umd', 'iife'],
    },
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
  },
});
