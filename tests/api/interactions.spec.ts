import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('Interactions API', async () => {
  await setup({
    server: true
  })

  it('should reject non-POST methods with 405', async () => {
    const methods = ['GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']

    for (const method of methods) {
      try {
        await $fetch('/api/interactions', {
          method: method as any
        })
        expect.fail(`Should have thrown an error for method ${method}`)
      } catch (error: any) {
        expect(error.status).toBe(405)
        expect(error.data.statusMessage).toBe('Method Not Allowed')
      }
    }
  })

  it('should require gameId and type on POST', async () => {
    try {
      await $fetch('/api/interactions', {
        method: 'POST',
        body: {}
      })
      expect.fail('Should have thrown an error')
    } catch (error: any) {
      expect(error.status).toBe(400)
      expect(error.data.statusMessage).toBe('Error handling interaction')
    }
  })
})
