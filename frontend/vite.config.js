import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'window',
  },
  server: {
    port: 5173,       // Fixed port
    strictPort: true, // If 5173 is busy, Vite will throw an error instead of picking another port
  },
});
