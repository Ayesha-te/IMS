import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@monaco-editor/react']
  },
  ssr: {
    noExternal: ['@monaco-editor/react', 'monaco-editor']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
});
