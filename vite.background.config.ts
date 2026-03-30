import { defineConfig } from 'vite'
import { resolve } from 'path'

// Background service worker build — ES module format (MV3 supports "type": "module")
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/background.ts'),
      formats: ['es'],
      fileName: () => 'background.js',
    },
  },
})
