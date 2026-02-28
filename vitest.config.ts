import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import autoImport from 'unplugin-auto-import/vite'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    vue(),
    autoImport({
      imports: [
        'vue',
        'vue-router',
        {
          'h3': ['defineEventHandler', 'defineCachedEventHandler', 'getQuery']
        }
      ]
    })
  ],
  test: {
    globals: true,
    environment: 'happy-dom',
    alias: {
      '~': resolve(__dirname, '.'),
      '@': resolve(__dirname, '.')
    }
  }
})
