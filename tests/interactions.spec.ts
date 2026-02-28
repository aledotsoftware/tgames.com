import { describe, it, expect } from 'vitest'
import { setup, fetch } from '@nuxt/test-utils/e2e'

describe('Interactions API', async () => {
  await setup({
    server: true
  })

  it('should return 400 for invalid interaction type', async () => {
    // Need to stringify the body and set correct Content-Type for readBody to work
    const res = await fetch('/api/interactions', {
      method: 'POST',
      body: JSON.stringify({
        gameId: 1,
        type: 'invalid_type'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    expect(res.status).toBe(400)

    // Expect Nuxt error object response
    const data = await res.json()
    expect(data.statusCode).toBe(400)
    expect(data.statusMessage).toBe('Error handling interaction')
  })
})
