import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../server/api/search'
import * as dbUtils from '../server/utils/db'

vi.mock('../server/utils/db')

describe('search API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return empty games array if q is missing', async () => {
        global.getQuery = vi.fn().mockReturnValue({})

        const result = await handler({} as any)

        expect(result).toEqual({ success: true, games: [] })
    })

    it('should return empty games array if q is less than 2 characters', async () => {
        global.getQuery = vi.fn().mockReturnValue({ q: 'a' })

        const result = await handler({} as any)

        expect(result).toEqual({ success: true, games: [] })
    })

    it('should handle array query parameters correctly (taking the first element)', async () => {
        global.getQuery = vi.fn().mockReturnValue({ q: ['abc', 'def'] })

        const mockRows = [{ id: 1, title: 'ABC Game' }]
        const mockQuery = vi.fn().mockResolvedValue([mockRows])
        vi.mocked(dbUtils.useDB).mockReturnValue({
            query: mockQuery
        } as any)

        const result = await handler({} as any)

        expect(result).toEqual({ success: true, games: mockRows })
        expect(mockQuery).toHaveBeenCalledTimes(1)
        expect(mockQuery.mock.calls[0][1]).toEqual(['abc%'])
    })

    it('should query the database successfully using the q% prefix', async () => {
        global.getQuery = vi.fn().mockReturnValue({ q: 'test' })

        const mockRows = [{ id: 1, title: 'Test Game 1' }, { id: 2, title: 'Test Game 2' }]
        const mockQuery = vi.fn().mockResolvedValue([mockRows])
        vi.mocked(dbUtils.useDB).mockReturnValue({
            query: mockQuery
        } as any)

        const result = await handler({} as any)

        expect(result).toEqual({ success: true, games: mockRows })
        expect(mockQuery).toHaveBeenCalledTimes(1)
        expect(mockQuery.mock.calls[0][0]).toContain('WHERE title LIKE ? AND published = 1')
        expect(mockQuery.mock.calls[0][1]).toEqual(['test%'])
    })

    it('should handle DB errors correctly, returning success: false', async () => {
        global.getQuery = vi.fn().mockReturnValue({ q: 'error-trigger' })

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

    it('should handle non-Error DB rejections correctly', async () => {
        global.getQuery = vi.fn().mockReturnValue({ q: 'error-trigger' })

        const mockError = 'String error message'
        const mockQuery = vi.fn().mockRejectedValue(mockError)
        vi.mocked(dbUtils.useDB).mockReturnValue({
            query: mockQuery
        } as any)

        const result = await handler({} as any)

        expect(result).toEqual({
            success: false,
            error: 'String error message'
        })
    })
})
