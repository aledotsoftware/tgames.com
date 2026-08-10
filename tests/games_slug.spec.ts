import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.stubGlobal('defineCachedEventHandler', (handler: any) => handler)
vi.stubGlobal('getRouterParam', vi.fn())
vi.stubGlobal('getQuery', vi.fn())
vi.stubGlobal('createError', vi.fn((err: any) => {
    const e = new Error(err.statusMessage)
    ;(e as any).statusCode = err.statusCode
    return e
}))

vi.mock('../server/utils/mongo', () => {
    return {
        useGamesCollection: vi.fn(),
        applyTranslation: vi.fn((doc) => doc)
    }
})

describe('server/api/games/[slug]', () => {
    let handler: any
    let mongoUtils: any

    beforeEach(async () => {
        vi.clearAllMocks()
        vi.resetModules()

        handler = (await import('../server/api/games/[slug]')).default
        mongoUtils = await import('../server/utils/mongo')
    })

    it('should return game details successfully', async () => {
        const mockFindOne = vi.fn().mockResolvedValue({ id: 1, title: 'Test Game', slug: 'test-game' })
        mongoUtils.useGamesCollection.mockResolvedValue({ findOne: mockFindOne })

        ;(globalThis as any).getRouterParam.mockReturnValue('test-game')
        ;(globalThis as any).getQuery.mockReturnValue({ lang: 'es' })

        const result = await handler({} as any)

        expect(result.success).toBe(true)
        expect(result.game.slug).toBe('test-game')
        expect(mockFindOne).toHaveBeenCalledWith({ slug: 'test-game', published: 1 }, expect.any(Object))
    })

    it('should throw 404 if game is not found', async () => {
        const mockFindOne = vi.fn().mockResolvedValue(null)
        mongoUtils.useGamesCollection.mockResolvedValue({ findOne: mockFindOne })

        ;(globalThis as any).getRouterParam.mockReturnValue('unknown-game')
        ;(globalThis as any).getQuery.mockReturnValue({ lang: 'es' })

        try {
            await handler({} as any)
            expect.fail('Should throw')
        } catch (err: any) {
            expect(err.statusCode).toBe(404)
        }
    })
})
