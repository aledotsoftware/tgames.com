import { describe, it, expect, vi, beforeEach } from 'vitest'

// Create variables that can be accessed by mock functions
const mockQuery = vi.fn()
const mockGetQuery = vi.fn()
const mockCreateError = vi.fn((err) => {
    return {
        ...err,
        toString() {
            return `Error: ${err.statusMessage}`
        }
    }
})

// Setup globals before importing the file
globalThis.getQuery = mockGetQuery
globalThis.createError = mockCreateError

// For h3/nitro defined globals
vi.stubGlobal('getQuery', mockGetQuery)
vi.stubGlobal('createError', mockCreateError)
vi.stubGlobal('defineCachedEventHandler', vi.fn((handler, options) => {
    // Return a wrapped function so we can attach options to it
    const wrapped = async (event: any) => handler(event)
    wrapped.options = options
    return wrapped
}))

// We mock the db
vi.mock('../../../../server/utils/db', () => ({
  useDB: () => ({
    query: (...args: any[]) => mockQuery(...args)
  })
}))

// We mock the pagination
vi.mock('../../../../server/utils/pagination', () => ({
  validatePagination: (query: any) => ({
    page: parseInt(query?.page) || 1,
    limit: parseInt(query?.limit) || 60
  })
}))

describe('Games List API', () => {
  let handler: any;

  beforeEach(async () => {
    vi.clearAllMocks()

    // Default returns
    mockGetQuery.mockReturnValue({})
    mockQuery.mockResolvedValue([[{ id: 1, title: 'Test Game' }], []])

    // Import the handler dynamically after mocks are set up
    const module = await import('../../../../server/api/games/index')
    handler = module.default
  })

  it('should return games list with default parameters', async () => {
    mockGetQuery.mockReturnValue({})

    const result = await handler({} as any)

    expect(result.success).toBe(true)
    expect(result.games).toEqual([{ id: 1, title: 'Test Game' }])

    // Check if the query is correct
    expect(mockQuery).toHaveBeenCalledTimes(1)
    const [query, params] = mockQuery.mock.calls[0]
    expect(query).toContain('SELECT g.id, g.slug, g.thumb_1, g.thumb_2, g.thumb_small,')
    expect(params).toEqual(['es', 60, 0])
  })

  it('should return games list with custom parameters', async () => {
    mockGetQuery.mockReturnValue({ lang: 'en', page: '2', limit: '20' })

    const result = await handler({} as any)

    expect(result.success).toBe(true)
    expect(result.games).toEqual([{ id: 1, title: 'Test Game' }])

    // Check if the query is correct
    expect(mockQuery).toHaveBeenCalledTimes(1)
    const [query, params] = mockQuery.mock.calls[0]
    expect(query).toContain('SELECT g.id, g.slug, g.thumb_1, g.thumb_2, g.thumb_small,')
    expect(params).toEqual(['en', 20, 20])
  })

  it('should handle database errors properly', async () => {
    mockGetQuery.mockReturnValue({})
    mockQuery.mockRejectedValue(new Error('Connection failed'))

    // Silence console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      await handler({} as any)
      // Should not reach here
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.statusMessage).toBe('Database Error: Connection failed')
    }

    expect(consoleSpy).toHaveBeenCalledWith('API Error /api/games:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('should handle non-Error objects in catch block', async () => {
    mockGetQuery.mockReturnValue({})
    mockQuery.mockRejectedValue('String Error')

    // Silence console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      await handler({} as any)
      // Should not reach here
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.statusMessage).toBe('Database Error: String Error')
    }

    expect(consoleSpy).toHaveBeenCalledWith('API Error /api/games:', 'String Error')
    consoleSpy.mockRestore()
  })

  it('should have correct cache options configured', () => {
    const options = handler.options
    expect(options.base).toBe('redis')
    expect(options.name).toBe('games-catalog')
    expect(options.maxAge).toBe(3600)
    expect(options.swr).toBe(true)

    // Test getKey function with default lang
    mockGetQuery.mockReturnValue({ page: '1', limit: '60' })
    const key1 = options.getKey({} as any)
    expect(key1).toBe('trending-es-p1-l60')

    // Test getKey function with custom lang
    mockGetQuery.mockReturnValue({ lang: 'en', page: '3', limit: '10' })
    const key2 = options.getKey({} as any)
    expect(key2).toBe('trending-en-p3-l10')
  })
})
