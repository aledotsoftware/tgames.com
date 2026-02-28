import { vi } from 'vitest'

vi.mock('nitropack', () => ({
  defineCachedEventHandler: vi.fn((handler) => handler)
}))

vi.mock('h3', () => ({
  getRouterParam: vi.fn(),
  getQuery: vi.fn(),
  createError: vi.fn((err) => {
    // When the application code throws `createError({...})`
    // And catch block processes it, it looks for statusCode in the thrown object
    // If it's not an instance of Error it doesn't get the message correctly.
    // So let's make it an actual Error object
    const e = new Error(err.statusMessage)
    ;(e as any).statusCode = err.statusCode
    ;(e as any).statusMessage = err.statusMessage
    return e
  })
}))

vi.mock('#imports', () => ({
  useDB: vi.fn()
}))
