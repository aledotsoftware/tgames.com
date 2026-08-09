import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../server/api/games/index'
import * as dbUtils from '../server/utils/db'

vi.mock('../server/utils/db')

describe('games API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset process.env and globals as needed
    })

    it('should return games list successfully', async () => {
        global.getQuery = vi.fn().mockReturnValue({ lang: 'en', page: 1, limit: 10 })

        const mockRows = [{ id: 1, title: 'Game 1' }, { id: 2, title: 'Game 2' }]
        const mockQuery = vi.fn().mockResolvedValue([mockRows])
        vi.mocked(dbUtils.useDB).mockReturnValue({
            query: mockQuery
        } as any)

        const result = await handler({} as any)

        expect(result).toEqual({
            success: true,
            games: mockRows
        })

        // Verify query parameters
        expect(mockQuery).toHaveBeenCalledTimes(1)
        const callArgs = mockQuery.mock.calls[0]
        expect(callArgs[1]).toEqual(['en', 10]) // lang, limit
    })

    it('should use default values for query parameters', async () => {
        global.getQuery = vi.fn().mockReturnValue({})

        const mockQuery = vi.fn().mockResolvedValue([[]])
        vi.mocked(dbUtils.useDB).mockReturnValue({
            query: mockQuery
        } as any)

        await handler({} as any)

        expect(mockQuery).toHaveBeenCalledTimes(1)
        const callArgs = mockQuery.mock.calls[0]
        expect(callArgs[1]).toEqual(['es', 60]) // default lang is 'es', default limit from validation is 60
    })

    it('should handle composite cursor parameter', async () => {
        global.getQuery = vi.fn().mockReturnValue({ cursor: '500_2000_100' })

        const mockQuery = vi.fn().mockResolvedValue([[]])
        vi.mocked(dbUtils.useDB).mockReturnValue({
            query: mockQuery
        } as any)

        await handler({} as any)

        expect(mockQuery).toHaveBeenCalledTimes(1)
        const callArgs = mockQuery.mock.calls[0]
        expect(callArgs[1]).toEqual(['es', 500, 500, 2000, 500, 2000, 100, 60]) // lang, cUpvote, cUpvote, cViews, cUpvote, cViews, cId, limit
        expect(callArgs[0]).toContain('g.upvote < ? OR (g.upvote = ? AND g.views < ?) OR (g.upvote = ? AND g.views = ? AND g.id < ?)')
    })

    it('should handle database error and throw a 500 error', async () => {
        global.getQuery = vi.fn().mockReturnValue({})

        const createErrorMock = vi.fn((err) => err)
        global.createError = createErrorMock

        const mockError = new Error('Connection failed')
        const mockQuery = vi.fn().mockRejectedValue(mockError)
        vi.mocked(dbUtils.useDB).mockReturnValue({
            query: mockQuery
        } as any)

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        let thrownError
        try {
            await handler({} as any)
        } catch (error: any) {
            thrownError = error
        }

        expect(thrownError).toBeDefined()
        expect(createErrorMock).toHaveBeenCalledWith({
            statusCode: 500,
            statusMessage: 'Database Error: Connection failed'
        })
        expect(thrownError.statusCode).toBe(500)
        expect(thrownError.statusMessage).toBe('Database Error: Connection failed')

        expect(consoleSpy).toHaveBeenCalledWith('API Error /api/games:', mockError)

        consoleSpy.mockRestore()
    })

    it('should handle non-Error database error objects correctly', async () => {
        global.getQuery = vi.fn().mockReturnValue({})

        const createErrorMock = vi.fn((err) => err)
        global.createError = createErrorMock

        const mockError = 'String error message'
        const mockQuery = vi.fn().mockRejectedValue(mockError)
        vi.mocked(dbUtils.useDB).mockReturnValue({
            query: mockQuery
        } as any)

        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

        let thrownError
        try {
            await handler({} as any)
        } catch (error: any) {
            thrownError = error
        }

        expect(thrownError).toBeDefined()
        expect(createErrorMock).toHaveBeenCalledWith({
            statusCode: 500,
            statusMessage: 'Database Error: String error message'
        })
        expect(thrownError.statusCode).toBe(500)
        expect(thrownError.statusMessage).toBe('Database Error: String error message')

        expect(consoleSpy).toHaveBeenCalledWith('API Error /api/games:', mockError)

        consoleSpy.mockRestore()
    })
})