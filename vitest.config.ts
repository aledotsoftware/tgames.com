import { defineConfig } from 'vitest/config'
import AutoImport from 'unplugin-auto-import/vite'

export default defineConfig({
  plugins: [
    AutoImport({
      imports: [
        {
          'nitropack': ['defineCachedEventHandler']
        },
        {
          'h3': ['getRouterParam', 'getQuery', 'createError']
        }
      ]
    })
  ],
  test: {
    setupFiles: ['./tests/setup.ts']
  }
})
