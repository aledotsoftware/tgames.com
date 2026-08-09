import { describe, it, expect, vi } from 'vitest'

// We must mock globals BEFORE importing the handler
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

// Mock the DB
vi.mock('../server/utils/db', () => {
    return {
        useDB: vi.fn()
    }
})

import { useDB } from '../server/utils/db'

describe('Game details API', () => {
    it('throws 404 when game is not found', async () => {
        // Dynamic import so globals are stubbed first
        const { default: handler } = await import('../server/api/games/[slug]')

        const mockDb = {
            query: vi.fn().mockResolvedValue([[]]) // Empty array for rows
        }
        vi.mocked(useDB).mockReturnValue(mockDb as any)

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
