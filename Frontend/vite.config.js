import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { terser } from 'rollup-plugin-terser';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig({
  base: "/",
  plugins: [react(),
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
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      plugins: [
        terser({
          compress: {},
          mangle: {},
          format: {
            comments: false,
          }
        })
      ]
    }
  },
})
