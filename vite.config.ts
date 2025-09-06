import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 5175,
    host: true
  },
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ["@monaco-editor/react", "monaco-editor"]
  },
  resolve: {
    mainFields: ['module', 'browser', 'main']
  },
  build: {
    commonjsOptions: {
      // Only apply CommonJS handling to monaco-editor
      include: [/node_modules\/monaco-editor\//]
    }
  },
  ssr: {
    noExternal: ['@monaco-editor/react', 'monaco-editor']
  }
});
