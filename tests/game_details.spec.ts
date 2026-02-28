import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRouterParam, getQuery } from 'h3'

import handler from '../server/api/games/[slug]'
import { useDB } from '../server/utils/db'

vi.mock('../server/utils/db', () => ({
  useDB: vi.fn()
}))

describe('game details api', () => {
  let mockDb: any

  beforeEach(() => {
    vi.clearAllMocks()
    mockDb = {
      query: vi.fn()
    }
    vi.mocked(useDB).mockReturnValue(mockDb)
  })

  it('should fetch game details successfully', async () => {
    const mockEvent = {}
    vi.mocked(getRouterParam).mockReturnValue('test-game')
    vi.mocked(getQuery).mockReturnValue({ lang: 'en' })

    mockDb.query.mockResolvedValue([
      [{ id: 1, title: 'Test Game', description: 'Test desc', instructions: 'Test instr', slug: 'test-game', published: 1 }]
    ])

    const result = await handler(mockEvent as any)

    expect(result).toEqual({
      success: true,
      game: { id: 1, title: 'Test Game', description: 'Test desc', instructions: 'Test instr', slug: 'test-game', published: 1 }
    })

    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT g.*'),
      ['en', 'en', 'en', 'test-game']
    )
  })

  it('should use default lang es if not provided', async () => {
    const mockEvent = {}
    vi.mocked(getRouterParam).mockReturnValue('test-game')
    vi.mocked(getQuery).mockReturnValue({})

    mockDb.query.mockResolvedValue([
      [{ id: 1, title: 'Test Game' }]
    ])

    await handler(mockEvent as any)

    expect(mockDb.query).toHaveBeenCalledWith(
      expect.stringContaining('SELECT g.*'),
      ['es', 'es', 'es', 'test-game']
    )
  })

  it('should throw 404 if game not found', async () => {
    const mockEvent = {}
    vi.mocked(getRouterParam).mockReturnValue('non-existent')
    vi.mocked(getQuery).mockReturnValue({})

    mockDb.query.mockResolvedValue([[]])

    await expect(handler(mockEvent as any)).rejects.toMatchObject({
      statusCode: 404,
      statusMessage: 'Juego no encontrado'
    })
  })

  it('should throw 500 on db error', async () => {
    const mockEvent = {}
    vi.mocked(getRouterParam).mockReturnValue('test-game')
    vi.mocked(getQuery).mockReturnValue({})

    mockDb.query.mockRejectedValue(new Error('DB connection failed'))

    await expect(handler(mockEvent as any)).rejects.toMatchObject({
      statusCode: 500,
      statusMessage: 'DB connection failed'
    })
  })
})
