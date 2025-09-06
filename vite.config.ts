import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Keep Monaco strictly client-side by avoiding optimizeDeps/ssr processing
export default defineConfig({
  plugins: [react()],
  // Do not force include Monaco in optimizeDeps; let it load dynamically in the browser
  optimizeDeps: {
    exclude: ['@monaco-editor/react', 'monaco-editor']
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
});