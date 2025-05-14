import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: '.vite/main',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main/main.ts'),
      },
    },
  },
}); 