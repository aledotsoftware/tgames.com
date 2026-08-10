import { describe, it, expect, vi, beforeEach } from 'vitest'
import handler from '../server/api/games/index'
import * as mongoUtils from '../server/utils/mongo'

vi.mock('../server/utils/mongo', () => ({
    useGamesCollection: vi.fn(),
    applyTranslation: vi.fn((doc) => doc)
}))

describe('games API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should return games list successfully', async () => {
        global.getQuery = vi.fn().mockReturnValue({ lang: 'en', page: 1, limit: 10 })

        const mockDocs = [{ id: 1, title: 'Game 1' }, { id: 2, title: 'Game 2' }]
        const mockFind = vi.fn().mockReturnValue({
            sort: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                    toArray: vi.fn().mockResolvedValue(mockDocs)
                })
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

    it('should use default values for query parameters', async () => {
        global.getQuery = vi.fn().mockReturnValue({})

        const mockFind = vi.fn().mockReturnValue({
            sort: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                    toArray: vi.fn().mockResolvedValue([])
                })
            })
        })
        vi.mocked(mongoUtils.useGamesCollection).mockResolvedValue({
            find: mockFind
        } as any)

        await handler({} as any)

        expect(mockFind).toHaveBeenCalledWith({ published: 1 }, expect.any(Object))
    })

    it('should handle composite cursor parameter', async () => {
        global.getQuery = vi.fn().mockReturnValue({ cursor: '500_2000_100' })

        const mockFind = vi.fn().mockReturnValue({
            sort: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                    toArray: vi.fn().mockResolvedValue([])
                })
            })
        })
        vi.mocked(mongoUtils.useGamesCollection).mockResolvedValue({
            find: mockFind
        } as any)

        await handler({} as any)

        expect(mockFind).toHaveBeenCalledWith({
            published: 1,
            $or: [
                { upvote: { $lt: 500 } },
                { upvote: 500, views: { $lt: 2000 } },
                { upvote: 500, views: 2000, id: { $lt: 100 } }
            ]
        }, expect.any(Object))
    })

    it('should handle database error and throw a 500 error', async () => {
        global.getQuery = vi.fn().mockReturnValue({})

        const createErrorMock = vi.fn((err) => err)
        global.createError = createErrorMock

        const mockError = new Error('Connection failed')
        vi.mocked(mongoUtils.useGamesCollection).mockRejectedValue(mockError)

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

        consoleSpy.mockRestore()
    })
})