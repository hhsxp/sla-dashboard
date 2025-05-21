import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',      // <— caminha para assets relativos
  plugins: [react()]
});
