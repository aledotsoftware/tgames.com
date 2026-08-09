import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../server/api/search'
import * as dbUtils from '../server/utils/db'

vi.mock('../server/utils/db')

describe('search API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return search results successfully', async () => {
        global.getQuery = vi.fn().mockReturnValue({ q: 'mario', lang: 'es' })

        const mockRows = [{ id: 1, title: 'Mario Bros' }]
        const mockQuery = vi.fn().mockResolvedValue([mockRows])
        vi.mocked(dbUtils.useDB).mockReturnValue({
            query: mockQuery
        } as any)

        const result = await handler({} as any)

        expect(result).toEqual({
            success: true,
            games: mockRows
        })

        expect(mockQuery).toHaveBeenCalledTimes(1)
        expect(mockQuery.mock.calls[0][1]).toEqual(['es', '%mario%', '%mario%'])
    })

    it('should handle array query parameter by taking the first element', async () => {
        global.getQuery = vi.fn().mockReturnValue({ q: ['sonic', 'mario'], lang: 'es' })

        const mockRows = [{ id: 2, title: 'Sonic the Hedgehog' }]
        const mockQuery = vi.fn().mockResolvedValue([mockRows])
        vi.mocked(dbUtils.useDB).mockReturnValue({
            query: mockQuery
        } as any)

        const result = await handler({} as any)

        expect(result).toEqual({
            success: true,
            games: mockRows
        })

        expect(mockQuery).toHaveBeenCalledTimes(1)
        expect(mockQuery.mock.calls[0][1]).toEqual(['es', '%sonic%', '%sonic%'])
    })

    it('should return empty games list if query length is less than 2', async () => {
        global.getQuery = vi.fn().mockReturnValue({ q: 'a' })

        const mockQuery = vi.fn()
        vi.mocked(dbUtils.useDB).mockReturnValue({
            query: mockQuery
        } as any)

        const result = await handler({} as any)

        expect(result).toEqual({
            success: true,
            games: []
        })

        expect(mockQuery).not.toHaveBeenCalled()
    })

    it('should return empty games list if query is missing', async () => {
        global.getQuery = vi.fn().mockReturnValue({})

        const mockQuery = vi.fn()
        vi.mocked(dbUtils.useDB).mockReturnValue({
            query: mockQuery
        } as any)

        const result = await handler({} as any)

        expect(result).toEqual({
            success: true,
            games: []
        })

        expect(mockQuery).not.toHaveBeenCalled()
    })

    it('should handle database errors and return success: false with error message', async () => {
        global.getQuery = vi.fn().mockReturnValue({ q: 'zelda' })

        const mockError = new Error('Database connection failed')
        const mockQuery = vi.fn().mockRejectedValue(mockError)
        vi.mocked(dbUtils.useDB).mockReturnValue({
            query: mockQuery
        } as any)

        const result = await handler({} as any)

        expect(result).toEqual({
            success: false,
            error: 'Database connection failed'
        })
    })

    it('should handle non-Error thrown objects during search', async () => {
        global.getQuery = vi.fn().mockReturnValue({ q: 'zelda' })

        const mockQuery = vi.fn().mockRejectedValue('String error')
        vi.mocked(dbUtils.useDB).mockReturnValue({
            query: mockQuery
        } as any)

        const result = await handler({} as any)

        expect(result).toEqual({
            success: false,
            error: 'String error'
        })
    })
})
