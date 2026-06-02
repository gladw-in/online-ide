import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { createHtmlPlugin } from 'vite-plugin-html';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: "/",
  plugins: [react(),
  tailwindcss(),
  createHtmlPlugin({
    minify: {
      collapseWhitespace: true,
      removeComments: true,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeScriptTypeAttributes: true,
      removeStyleTypeAttributes: true,
      minifyCSS: true,
      minifyJS: true,
    },
  }),
  ],
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      format: {
        comments: false
      },
      mangle: {
        toplevel: true
      }
    },
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[hash].js',
        chunkFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
      },
    },
  },
})
