import { vi } from 'vitest'

// Mock nitro/h3 globals
global.defineCachedEventHandler = vi.fn((fn) => fn)
global.getQuery = vi.fn()
global.createError = vi.fn((err) => err)