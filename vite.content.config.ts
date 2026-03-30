import { defineConfig } from 'vite'
import { resolve } from 'path'

// Content script build — compiled as IIFE so it works as a non-module content script
export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/content.ts'),
      name: 'PlaybackPilot',
      formats: ['iife'],
      fileName: () => 'content.js',
    },
    rollupOptions: {
      output: {
        // Inline any dynamic imports so the output is a single self-contained file
        inlineDynamicImports: true,
      },
    },
  },
})
