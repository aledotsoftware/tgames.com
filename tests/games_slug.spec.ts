import { describe, it, expect, vi, beforeEach } from 'vitest'

// We need to define globals before importing the handler
vi.stubGlobal('defineCachedEventHandler', (handler: any) => handler)
vi.stubGlobal('getRouterParam', vi.fn())
vi.stubGlobal('getQuery', vi.fn())
vi.stubGlobal('createError', vi.fn((err: any) => new Error(err.statusMessage)))

// Provide global auto-imports that the file expects
;(globalThis as any).defineCachedEventHandler = (handler: any) => handler;
;(globalThis as any).getRouterParam = vi.fn();
;(globalThis as any).getQuery = vi.fn();
;(globalThis as any).createError = vi.fn((err: any) => new Error(err.statusMessage));

// Mock useDB
vi.mock('../server/utils/db', () => {
    return {
        useDB: vi.fn()
    }
})

describe('server/api/games/[slug]', () => {
    let handler: any;
    let useDB: any;

    beforeEach(async () => {
        vi.clearAllMocks()
        vi.resetModules()

        // Re-import the handler and useDB for each test to ensure clean state
        handler = (await import('../server/api/games/[slug]')).default
        useDB = (await import('../server/utils/db')).useDB
    })

    it('should use "es" as language fallback when lang parameter is missing', async () => {
        const mockQuery = vi.fn().mockResolvedValue([[{ id: 1, title: 'Test Game', slug: 'test-game' }]])
        useDB.mockReturnValue({ query: mockQuery })

        const mockGetRouterParam = (globalThis as any).getRouterParam
        mockGetRouterParam.mockReturnValue('test-game')

        const mockGetQuery = (globalThis as any).getQuery
        mockGetQuery.mockReturnValue({})

        const event = {} as any

        const result = await handler(event)

        expect(result.success).toBe(true)
        expect(result.game.slug).toBe('test-game')

        expect(mockQuery).toHaveBeenCalledTimes(1)
        const callArgs = mockQuery.mock.calls[0]

        expect(callArgs[0]).toContain('AND t1.language = ?')
        expect(callArgs[0]).toContain('AND t2.language = ?')
        expect(callArgs[0]).toContain('AND t3.language = ?')
        expect(callArgs[0]).toContain('WHERE g.slug = ?')

        expect(callArgs[1]).toEqual(['es', 'es', 'es', 'test-game'])
    })

    it('should use provided language parameter when present', async () => {
        const mockQuery = vi.fn().mockResolvedValue([[{ id: 1, title: 'Test Game', slug: 'test-game' }]])
        useDB.mockReturnValue({ query: mockQuery })

        const mockGetRouterParam = (globalThis as any).getRouterParam
        mockGetRouterParam.mockReturnValue('test-game')

        const mockGetQuery = (globalThis as any).getQuery
        mockGetQuery.mockReturnValue({ lang: 'en' })

        const event = {} as any

        const result = await handler(event)

        expect(result.success).toBe(true)

        expect(mockQuery).toHaveBeenCalledTimes(1)
        const callArgs = mockQuery.mock.calls[0]

        expect(callArgs[1]).toEqual(['en', 'en', 'en', 'test-game'])
    })
})
