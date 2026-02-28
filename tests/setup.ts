import { vi } from 'vitest'

global.defineCachedEventHandler = vi.fn((handler) => handler)
global.getQuery = vi.fn(() => ({}))
global.createError = vi.fn((err) => err)
