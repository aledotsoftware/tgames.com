import { describe, it, expect, vi } from 'vitest'

const mockDefineCachedEventHandler = vi.fn((handler) => handler)
const mockGetRouterParam = vi.fn((event, param) => event.context?.params?.[param])
const mockGetQuery = vi.fn((event) => event.query || {})
const mockCreateError = vi.fn((err) => {
    const error = new Error(err.statusMessage)
    ;(error as any).statusCode = err.statusCode
    return error
})

vi.stubGlobal('defineCachedEventHandler', mockDefineCachedEventHandler)
vi.stubGlobal('getRouterParam', mockGetRouterParam)
vi.stubGlobal('getQuery', mockGetQuery)
vi.stubGlobal('createError', mockCreateError)

vi.mock('../server/utils/mongo', () => {
    return {
        useGamesCollection: vi.fn(),
        applyTranslation: vi.fn((doc) => doc)
    }
})

import { useGamesCollection } from '../server/utils/mongo'

describe('Game details API', () => {
    it('throws 404 when game is not found', async () => {
        const { default: handler } = await import('../server/api/games/[slug]')

        const mockFindOne = vi.fn().mockResolvedValue(null)
        vi.mocked(useGamesCollection).mockResolvedValue({ findOne: mockFindOne } as any)

        const event = {
            context: {
                params: {
                    slug: 'non-existent-game'
                }
            },
            query: {
                lang: 'es'
            }
        }

        try {
            await handler(event as any)
            expect.fail('Should have thrown an error')
        } catch (error: any) {
            expect(error.statusCode).toBe(404)
            expect(error.message).toBe('Juego no encontrado')
        }
    })
})
