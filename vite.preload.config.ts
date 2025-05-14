import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: '.vite/preload',
    rollupOptions: {
      input: {
        preload: resolve(__dirname, 'src/preload/preload.ts'),
      },
    },
  },
}); 