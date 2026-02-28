import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mocking the dependencies
vi.mock('../../../../server/utils/db', () => ({
  useDB: vi.fn()
}))

vi.mock('../../../../server/utils/pagination', () => ({
  validatePagination: vi.fn()
}))

// Import the endpoint
import apiGamesIndex from '../../../../server/api/games/index'

import { useDB } from '../../../../server/utils/db'
import { validatePagination } from '../../../../server/utils/pagination'

describe('server/api/games/index.ts', () => {
  const dbQueryMock = vi.fn()
  const getQueryMock = globalThis.getQuery as any
  const createErrorMock = globalThis.createError as any

  beforeEach(() => {
    vi.clearAllMocks()
    ;(useDB as any).mockReturnValue({
      query: dbQueryMock
    })
  })

  it('should parse query parameters correctly with defaults', async () => {
    // Setup
    getQueryMock.mockReturnValue({})
    ;(validatePagination as any).mockReturnValue({ page: 1, limit: 60 })
    dbQueryMock.mockResolvedValue([[{ id: 1, title: 'Game 1' }]])

    // The export is our mock object containing handler and options
    const endpoint = apiGamesIndex as any
    const handler = endpoint.handler

    // Execute
    const result = await handler({} as any)

    // Verify lang defaults to 'es'
    expect(dbQueryMock).toHaveBeenCalledWith(
      expect.any(String),
      ['es', 60, 0] // lang=es, limit=60, offset=0
    )

    // Verify getKey defaults
    const key = endpoint.options.getKey({} as any)
    expect(key).toBe('trending-es-p1-l60')

    // Verify result
    expect(result).toEqual({ success: true, games: [{ id: 1, title: 'Game 1' }] })
  })

  it('should parse provided lang query parameter', async () => {
    // Setup
    getQueryMock.mockReturnValue({ lang: 'en', page: '2', limit: '30' })
    ;(validatePagination as any).mockReturnValue({ page: 2, limit: 30 })
    dbQueryMock.mockResolvedValue([[]])

    const endpoint = apiGamesIndex as any
    const handler = endpoint.handler

    await handler({} as any)

    // Verify lang=en, limit=30, offset=30
    expect(dbQueryMock).toHaveBeenCalledWith(
      expect.any(String),
      ['en', 30, 30]
    )

    // Verify getKey
    const key = endpoint.options.getKey({} as any)
    expect(key).toBe('trending-en-p2-l30')
  })

  it('should parse invalid query parameters correctly using defaults', async () => {
    // Setup
    getQueryMock.mockReturnValue({ lang: 'it', page: 'invalid', limit: 'invalid' })
    ;(validatePagination as any).mockReturnValue({ page: 1, limit: 60 })
    dbQueryMock.mockResolvedValue([[]])

    const endpoint = apiGamesIndex as any
    const handler = endpoint.handler

    await handler({} as any)

    // Verify lang=it, limit=60, offset=0
    expect(dbQueryMock).toHaveBeenCalledWith(
      expect.any(String),
      ['it', 60, 0]
    )

    // Verify getKey
    const key = endpoint.options.getKey({} as any)
    expect(key).toBe('trending-it-p1-l60')
  })

  it('should handle database errors properly', async () => {
    // Setup
    getQueryMock.mockReturnValue({})
    ;(validatePagination as any).mockReturnValue({ page: 1, limit: 60 })
    dbQueryMock.mockRejectedValue(new Error('Connection failed'))
    createErrorMock.mockImplementation((err: any) => err)

    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const endpoint = apiGamesIndex as any
    const handler = endpoint.handler

    // Execute & Verify
    await expect(handler({} as any)).rejects.toEqual({
      statusCode: 500,
      statusMessage: 'Database Error: Connection failed'
    })

    expect(createErrorMock).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
