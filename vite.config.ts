import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [tailwindcss()],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        options: "src/options.ts",
        content: "src/content.ts"
      },
      output: {
        entryFileNames: `[name].js`
      },
    },
  },
})