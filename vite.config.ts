import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['@monaco-editor/react'], // pre-bundle Monaco for Vite
  },
  resolve: {
    mainFields: ['module', 'browser', 'main'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/, /@monaco-editor/], // ensure Vite handles CommonJS
    },
  },
  ssr: {
    noExternal: ['@monaco-editor/react', 'monaco-editor'],
  },
});
