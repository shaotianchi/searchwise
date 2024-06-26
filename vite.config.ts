import path from 'path';
import { defineConfig } from 'vite';

import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/main.tsx'),
        content: path.resolve(__dirname, 'src/scripts/content.tsx'),
      },
      output: {
        dir: 'dist',
        entryFileNames: (chunkInfo) => {
          const subdir = chunkInfo.facadeModuleId?.includes('scripts')
            ? 'scripts/'
            : ''
          return `${subdir}[name].js`
        },
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  plugins: [react()],
})
