import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  build: {
    outDir: '.vite/main',
    emptyOutDir: true,
    lib: {
      entry: {
        main: path.resolve(__dirname, 'src/main/index.ts'),
        preload: path.resolve(__dirname, 'src/preload/preload.ts')
      },
      formats: ['cjs'],
      fileName: (format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: ['electron'],
    },
  },
}); 