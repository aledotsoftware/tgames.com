import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../server/api/search'
import * as mongoUtils from '../server/utils/mongo'

vi.mock('../server/utils/mongo', () => ({
    useGamesCollection: vi.fn(),
    applyTranslation: vi.fn((doc) => doc)
}))

describe('search API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return search results successfully', async () => {
        global.getQuery = vi.fn().mockReturnValue({ q: 'mario', lang: 'es' })

        const mockDocs = [{ id: 1, title: 'Mario Bros' }]
        const mockFind = vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
                toArray: vi.fn().mockResolvedValue(mockDocs)
            })
        })
        vi.mocked(mongoUtils.useGamesCollection).mockResolvedValue({
            find: mockFind
        } as any)

        const result = await handler({} as any)

        expect(result).toEqual({
            success: true,
            games: mockDocs
        })
    })

    it('should return empty games list if query length is less than 2', async () => {
        global.getQuery = vi.fn().mockReturnValue({ q: 'a' })

        const mockFind = vi.fn()
        vi.mocked(mongoUtils.useGamesCollection).mockResolvedValue({
            find: mockFind
        } as any)

        const result = await handler({} as any)

        expect(result).toEqual({
            success: true,
            games: []
        })

        expect(mockFind).not.toHaveBeenCalled()
    })

    it('should handle database errors and return success: false with error message', async () => {
        global.getQuery = vi.fn().mockReturnValue({ q: 'zelda' })

        const mockError = new Error('Database connection failed')
        vi.mocked(mongoUtils.useGamesCollection).mockRejectedValue(mockError)

        const result = await handler({} as any)

        expect(result).toEqual({
            success: false,
            games: [],
            error: 'Database connection failed'
        })
    })
})
