import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock h3 functions before importing the handler
vi.mock('h3', () => ({
  defineEventHandler: vi.fn((handler) => handler),
  defineCachedEventHandler: vi.fn((handler) => handler),
  getQuery: vi.fn()
}))

// Mock DB util
const queryMock = vi.fn()
vi.mock('../../../server/utils/db', () => ({
  useDB: vi.fn(() => ({
    query: queryMock
  }))
}))

import searchHandler from '../../../server/api/search'
import { getQuery } from 'h3'
import { useDB } from '../../../server/utils/db'

describe('Search API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryMock.mockReset()
  })

  it('returns empty list when q is missing', async () => {
    vi.mocked(getQuery).mockReturnValue({})
    const result = await (searchHandler as any)({} as any)
    expect(result).toEqual({ success: true, games: [] })
    expect(useDB).not.toHaveBeenCalled()
  })

  it('returns empty list when q is too short (< 2 chars)', async () => {
    vi.mocked(getQuery).mockReturnValue({ q: 'a' })
    const result = await (searchHandler as any)({} as any)
    expect(result).toEqual({ success: true, games: [] })
    expect(useDB).not.toHaveBeenCalled()
  })

  it('returns empty list when q is not a string (e.g., object)', async () => {
    vi.mocked(getQuery).mockReturnValue({ q: { foo: 'bar' } })
    const result = await (searchHandler as any)({} as any)
    expect(result).toEqual({ success: true, games: [] })
    expect(useDB).not.toHaveBeenCalled()
  })

  it('handles array for q, takes first element, and returns empty if too short', async () => {
    vi.mocked(getQuery).mockReturnValue({ q: ['a', 'b'] })
    const result = await (searchHandler as any)({} as any)
    expect(result).toEqual({ success: true, games: [] })
    expect(useDB).not.toHaveBeenCalled()
  })

  it('performs DB query when q is valid string', async () => {
    vi.mocked(getQuery).mockReturnValue({ q: 'minecraft' })
    const mockRows = [
      { id: 1, title: 'Minecraft', slug: 'minecraft' },
      { id: 2, title: 'Minecraft 2D', slug: 'minecraft-2d' }
    ]
    queryMock.mockResolvedValue([mockRows])

    const result = await (searchHandler as any)({} as any)

    expect(useDB).toHaveBeenCalled()
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id, title, slug, thumb_small, thumb_1'),
      ['minecraft%']
    )
    expect(result).toEqual({ success: true, games: mockRows })
  })

  it('handles array for q, takes first element, and performs DB query if valid', async () => {
    vi.mocked(getQuery).mockReturnValue({ q: ['minecraft', 'invalid'] })
    const mockRows = [{ id: 1, title: 'Minecraft', slug: 'minecraft' }]
    queryMock.mockResolvedValue([mockRows])

    const result = await (searchHandler as any)({} as any)

    expect(useDB).toHaveBeenCalled()
    expect(queryMock).toHaveBeenCalledWith(
      expect.stringContaining('SELECT id, title, slug, thumb_small, thumb_1'),
      ['minecraft%']
    )
    expect(result).toEqual({ success: true, games: mockRows })
  })

  it('handles database errors gracefully and returns success: false', async () => {
    vi.mocked(getQuery).mockReturnValue({ q: 'minecraft' })
    const dbError = new Error('Connection refused')
    queryMock.mockRejectedValue(dbError)

    const result = await (searchHandler as any)({} as any)

    expect(useDB).toHaveBeenCalled()
    expect(result).toEqual({ success: false, error: 'Connection refused' })
  })

  it('handles non-Error database rejections gracefully', async () => {
    vi.mocked(getQuery).mockReturnValue({ q: 'minecraft' })
    queryMock.mockRejectedValue('String error')

    const result = await (searchHandler as any)({} as any)

    expect(useDB).toHaveBeenCalled()
    expect(result).toEqual({ success: false, error: 'String error' })
  })
})
