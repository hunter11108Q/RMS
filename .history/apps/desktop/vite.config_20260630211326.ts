import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/renderer'),
      '@rms/constants': path.resolve(__dirname, '../../packages/constants/src'),
      '@rms/types': path.resolve(__dirname, '../../packages/types/src'),
      '@rms/api-contracts': path.resolve(__dirname, '../../packages/api-contracts/src'),
      '@rms/validation': path.resolve(__dirname, '../../packages/validation/src'),
      '@rms/theme': path.resolve(__dirname, '../../packages/theme/src'),
      '@rms/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@rms/hooks': path.resolve(__dirname, '../../packages/hooks/src'),
      '@rms/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    host: "127.0.0.1",
    port: 5180,
    strictPort: true,
  },
});
