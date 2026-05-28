import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // pre-bundla o lucide-react num modulo so. Sem isso, o dev server serve
    // ~1000 icones individuais e o navegador fica em branco enquanto carrega.
    include: ['lucide-react'],
  },
});
