import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'assets',
    emptyOutDir: false,
    rollupOptions: {
      input: 'src/main.jsx',
      output: {
        entryFileNames: 'js/index.js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'css/index.css';
          }
          return 'media/[name]-[hash][extname]';
        }
      }
    }
  }
});
