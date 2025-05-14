import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      babel: {
        presets: [
          ['@babel/preset-react', { runtime: 'automatic' }]
        ],
        plugins: [
          ['babel-plugin-styled-components', { 
            displayName: true,
            ssr: false,
            pure: true
          }]
        ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  root: path.join(__dirname, 'src/renderer'),
  base: './',
  build: {
    outDir: path.join(__dirname, '.vite/renderer'),
    emptyOutDir: true,
    target: 'esnext',
    modulePreload: {
      polyfill: true
    },
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/renderer/index.html')
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'styled-components', 'react-feather']
  },
  publicDir: path.join(__dirname, 'src/renderer/public')
}); 