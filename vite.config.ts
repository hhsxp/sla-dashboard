// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Publica assets com paths relativos (útil para hosts estáticos)
  base: './',

  // Plugins
  plugins: [react()],

  // Configuração do servidor de desenvolvimento
  server: {
    host: true,      // permite acesso via 0.0.0.0 no Docker/Render
    port: 5173,      // porta padrão do Vite
    open: false      // não abre o browser automaticamente
  },

  // Configuração de build
  build: {
    outDir: 'dist',  // pasta de saída
    sourcemap: false,// desabilita sourcemaps para produção
    rollupOptions: {
      // se precisar de customizações no Rollup, coloque aqui
    }
  },

  // Configuração do preview (usado pelo `vite preview` / npm start)
  preview: {
    host: true,
    port: Number(process.env.PORT) || 4173
  }
});
