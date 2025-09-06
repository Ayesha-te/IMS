import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 5175,
    host: true
  },
  plugins: [react(), tailwindcss()],
  // Ensure Monaco is pre-bundled for Vite compatibility
  optimizeDeps: {
    include: ['@monaco-editor/react'],
  },
  resolve: {
    mainFields: ['module', 'browser', 'main']
  },
  build: {
    commonjsOptions: {
      // Apply CommonJS handling to all node_modules for broad compatibility
      include: [/node_modules/],
    },
  },
  // Ensure SSR bundling when imported at runtime
  ssr: {
    noExternal: ['@monaco-editor/react', 'monaco-editor']
  }
});
