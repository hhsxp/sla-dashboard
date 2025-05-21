import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Para funcionar em qualquer subdiretório
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: true,
  },
});
