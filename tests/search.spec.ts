import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock dependencies
const mockQuery = vi.fn().mockResolvedValue([[{ id: 1, title: 'Test Game', slug: 'test-game', thumb_small: 'small.jpg', thumb_1: 'thumb1.jpg' }]])
vi.mock('../server/utils/db', () => ({
  useDB: vi.fn(() => ({
    query: mockQuery
  }))
}))

const getQueryMock = vi.fn()
vi.stubGlobal('getQuery', getQueryMock)

import searchHandler from '../server/api/search'

describe('Search API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty games array for short queries (< 2 chars)', async () => {
    // Mock the query
    getQueryMock.mockReturnValue({ q: 'a' })

    // Call handler
    const result = await searchHandler({} as any)

    // Verify
    expect(result).toEqual({ success: true, games: [] })
    expect(getQueryMock).toHaveBeenCalledTimes(1)
    expect(mockQuery).not.toHaveBeenCalled()
  })

  it('should return empty games array for empty query', async () => {
    // Mock the query
    getQueryMock.mockReturnValue({})

    // Call handler
    const result = await searchHandler({} as any)

    // Verify
    expect(result).toEqual({ success: true, games: [] })
    expect(getQueryMock).toHaveBeenCalledTimes(1)
    expect(mockQuery).not.toHaveBeenCalled()
  })

  it('should perform search for queries with length >= 2', async () => {
    getQueryMock.mockReturnValue({ q: 'test' })

    const result = await searchHandler({} as any)

    expect(result).toEqual({
      success: true,
      games: [{ id: 1, title: 'Test Game', slug: 'test-game', thumb_small: 'small.jpg', thumb_1: 'thumb1.jpg' }]
    })
    expect(getQueryMock).toHaveBeenCalledTimes(1)
    expect(mockQuery).toHaveBeenCalledTimes(1)
    expect(mockQuery).toHaveBeenCalledWith(
        `SELECT id, title, slug, thumb_small, thumb_1
       FROM games
       WHERE title LIKE ? AND published = 1
       LIMIT 10`,
        ['test%']
    )
  })

  it('should take first element if query is an array', async () => {
    getQueryMock.mockReturnValue({ q: ['test1', 'test2'] })

    const result = await searchHandler({} as any)

    expect(result.success).toBe(true)
    expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        ['test1%']
    )
  })

  it('should handle db errors correctly', async () => {
    getQueryMock.mockReturnValue({ q: 'test' })
    mockQuery.mockRejectedValueOnce(new Error('DB Error'))

    const result = await searchHandler({} as any)

    expect(result).toEqual({
      success: false,
      error: 'DB Error'
    })
  })
})
