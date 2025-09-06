import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 5175,
    host: true
  },
  plugins: [react(), tailwindcss()],
  // Do not force prebundling of Monaco packages in production build to avoid resolver issues
  // optimizeDeps only affects dev; leaving it empty prevents unnecessary resolution in CI
  optimizeDeps: {},
  resolve: {
    mainFields: ['module', 'browser', 'main']
  },
  build: {
    commonjsOptions: {
      // Only apply CommonJS handling to monaco-editor when used
      include: [/node_modules\/monaco-editor\//]
    }
  },
  // Ensure SSR bundling when imported at runtime
  ssr: {
    noExternal: ['@monaco-editor/react', 'monaco-editor']
  }
});
