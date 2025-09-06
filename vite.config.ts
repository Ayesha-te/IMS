import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['@monaco-editor/react', 'monaco-editor']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
});