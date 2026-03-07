import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createEvent, H3Event, IncomingMessage, ServerResponse } from 'h3'
import * as h3 from 'h3'

vi.stubGlobal('defineCachedEventHandler', (handler: any) => handler)
vi.stubGlobal('getQuery', h3.getQuery)

const mockQuery = vi.fn().mockResolvedValue([[]])

// we must dynamically import the handler AFTER globals are mocked
vi.mock('../../server/utils/db', () => ({
    useDB: vi.fn(() => ({
        query: mockQuery
    }))
}))

function createMockEvent(url: string): H3Event {
    const req = { url, method: 'GET', headers: {} } as IncomingMessage
    const res = { end: vi.fn(), setHeader: vi.fn() } as unknown as ServerResponse
    return createEvent(req, res)
}

describe('Related Games API', () => {
    // Clear mocks before each test to ensure we have a clean slate
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns empty games array when category is missing', async () => {
        const module = await import('../../server/api/games/related')
        const relatedHandler = module.default

        const event = createMockEvent('/api/games/related?lang=es')

        const result = await relatedHandler(event)
        expect(result).toEqual({ success: true, games: [] })
        expect(mockQuery).not.toHaveBeenCalled()
    })

    it('returns empty games array when category is empty string', async () => {
        const module = await import('../../server/api/games/related')
        const relatedHandler = module.default

        const event = createMockEvent('/api/games/related?lang=en&category=')

        const result = await relatedHandler(event)
        expect(result).toEqual({ success: true, games: [] })
        expect(mockQuery).not.toHaveBeenCalled()
    })

    it('returns db rows when category is provided', async () => {
        const module = await import('../../server/api/games/related')
        const relatedHandler = module.default

        const event = createMockEvent('/api/games/related?lang=en&category=action')

        const result = await relatedHandler(event)
        expect(result).toEqual({ success: true, games: [] })
        expect(mockQuery).toHaveBeenCalled()
    })
})
