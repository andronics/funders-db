import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

/**
 * Plugin to copy JSONL data file to public directory
 * This allows the app to fetch it at runtime instead of bundling
 */
function copyJsonlToPublic() {
  return {
    name: 'copy-jsonl',
    buildStart() {
      const publicDir = resolve(__dirname, 'public');
      if (!existsSync(publicDir)) {
        mkdirSync(publicDir, { recursive: true });
      }

      const source = resolve(__dirname, 'data/funders.jsonl');
      const dest = resolve(publicDir, 'funders.jsonl');

      if (existsSync(source)) {
        copyFileSync(source, dest);
        console.log('Copied funders.jsonl to public/');
      } else {
        console.warn('Warning: data/funders.jsonl not found');
      }
    }
  };
}

export default defineConfig({
  base: '/funders-db/',
  plugins: [react(), copyJsonlToPublic()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-export': ['jspdf', 'jspdf-autotable'],
        }
      }
    }
  }
});
