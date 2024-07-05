import { defineConfig } from 'vite';

import { crx } from '@crxjs/vite-plugin';
import react from '@vitejs/plugin-react-swc';

import manifest from './manifest.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  server: {
    port: 3000, // 确保定义了端口
  },
})
