import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockQuery = vi.fn()

vi.mock('../../utils/db', () => ({
    useDB: vi.fn(() => ({
        query: mockQuery
    }))
}))

// Mock defineCachedEventHandler before imports
vi.stubGlobal('defineCachedEventHandler', (handler: any, options: any) => {
    return Object.assign(handler, { options });
})

vi.stubGlobal('getQuery', (event: any) => event.query || {})
vi.stubGlobal('createError', (err: any) => new Error(err.statusMessage))

describe('related games api', () => {
    let handler: any

    beforeEach(async () => {
        vi.clearAllMocks()
        handler = (await import('./related')).default
    })

    it('returns empty array when category is not provided', async () => {
        const event = { query: {} }
        const result = await handler(event)

        expect(result).toEqual({
            success: true,
            games: []
        })
        expect(mockQuery).not.toHaveBeenCalled()
    })

    it('fetches related games when category is provided', async () => {
        const mockGames = [
            { id: 1, slug: 'game-1', title: 'Game 1' },
            { id: 2, slug: 'game-2', title: 'Game 2' }
        ]
        mockQuery.mockResolvedValueOnce([mockGames])

        const event = { query: { category: 'action', lang: 'en' } }
        const result = await handler(event)

        expect(result).toEqual({
            success: true,
            games: mockGames
        })

        expect(mockQuery).toHaveBeenCalledTimes(1)
        const [queryStr, params] = mockQuery.mock.calls[0]

        expect(queryStr).toContain('FROM games g')
        expect(queryStr).toContain('WHERE g.published = 1')
        expect(queryStr).toContain('AND g.category = ?')
        expect(queryStr).toContain('ORDER BY g.views DESC')
        expect(queryStr).toContain('LIMIT 20')

        expect(params).toEqual(['en', 'action'])
    })

    it('uses default language "es" if lang is not provided', async () => {
        const mockGames = [{ id: 1, title: 'Juego' }]
        mockQuery.mockResolvedValueOnce([mockGames])

        const event = { query: { category: 'puzzle' } }
        const result = await handler(event)

        expect(result).toEqual({
            success: true,
            games: mockGames
        })

        const [_, params] = mockQuery.mock.calls[0]
        expect(params).toEqual(['es', 'puzzle'])
    })

    it('handles database errors properly', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        mockQuery.mockRejectedValueOnce(new Error('Connection failed'))

        const event = { query: { category: 'action' } }

        await expect(handler(event)).rejects.toThrow('Error connecting to database: Connection failed')

        expect(consoleSpy).toHaveBeenCalledWith('DB Error:', expect.any(Error))

        consoleSpy.mockRestore()
    })

    it('handles non-Error objects thrown properly', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
        mockQuery.mockRejectedValueOnce('Some string error')

        const event = { query: { category: 'action' } }

        await expect(handler(event)).rejects.toThrow('Error connecting to database: Unknown error')

        expect(consoleSpy).toHaveBeenCalledWith('DB Error:', 'Some string error')

        consoleSpy.mockRestore()
    })

    it('has correct cache configuration', async () => {
        expect(handler.options).toBeDefined()
        expect(handler.options.base).toBe('redis')
        expect(handler.options.name).toBe('games-related')
        expect(handler.options.maxAge).toBe(3600)
        expect(handler.options.swr).toBe(true)

        // Test key generation
        const getKey = handler.options.getKey

        expect(getKey({ query: { category: 'action', lang: 'en' } })).toBe('related-action-en')
        expect(getKey({ query: { category: 'action' } })).toBe('related-action-es')
        expect(getKey({ query: {} })).toBe('related-none-es')
    })
})
