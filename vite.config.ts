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
    include: ["@monaco-editor/react"]
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/]
    }
  }
});
