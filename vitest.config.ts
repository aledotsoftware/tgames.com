import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    // We need to enable globals to use vi, describe, it, etc without importing them
    globals: true,
  }
})
