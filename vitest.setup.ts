import { vi } from 'vitest'

const getQueryMock = vi.fn()
const createErrorMock = vi.fn()
const defineCachedEventHandlerMock = vi.fn((handler: any, options: any) => {
  return { handler, options }
})

globalThis.getQuery = getQueryMock
globalThis.createError = createErrorMock
globalThis.defineCachedEventHandler = defineCachedEventHandlerMock
