import { describe, it, expect, vi, beforeEach } from 'vitest'

// 1. Mock the DB module
const mockExecute = vi.fn()
vi.mock('../../../server/utils/db', () => {
    return {
        useDB: () => ({
            execute: mockExecute
        })
    }
})

// 2. Mock globals (auto-imports from h3)
import * as h3 from 'h3'
vi.mock('h3', async (importOriginal) => {
    const actual = await importOriginal<typeof import('h3')>()
    return {
        ...actual,
        defineEventHandler: (handler: any) => handler,
        readBody: vi.fn(),
        createError: (err: any) => {
            const error = new Error(err.statusMessage)
            Object.assign(error, err)
            return error
        },
        getRequestIP: vi.fn(() => '127.0.0.1')
    }
})

global.defineEventHandler = (handler: any) => handler
global.readBody = vi.fn() as any
global.createError = ((err: any) => {
    const error = new Error(err.statusMessage)
    Object.assign(error, err)
    return error
}) as any
global.getRequestIP = vi.fn(() => '127.0.0.1') as any

// 3. Import the handler
import handler from '../../../server/api/interactions'

describe('Interactions API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should throw 405 if method is not POST', async () => {
        const event = { method: 'GET' }
        await expect(handler(event as any)).rejects.toThrow('Method Not Allowed')
    })

    it('should throw 400 if gameId or type is missing', async () => {
        const event = { method: 'POST' }
        vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ gameId: null, type: 'like' }))

        await expect(handler(event as any)).rejects.toThrow('Error handling interaction')

        vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ gameId: '123', type: null }))
        await expect(handler(event as any)).rejects.toThrow('Error handling interaction')
    })

    it('should throw 400 for invalid game IDs', async () => {
        const event = { method: 'POST' }

        // Zero
        vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ gameId: 0, type: 'like' }))
        await expect(handler(event as any)).rejects.toThrow('Error handling interaction')

        // Negative
        vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ gameId: -5, type: 'like' }))
        await expect(handler(event as any)).rejects.toThrow('Error handling interaction')

        // Non-integer string
        vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ gameId: 'abc', type: 'like' }))
        await expect(handler(event as any)).rejects.toThrow('Error handling interaction')
    })

    it('should throw 400 for invalid interaction types', async () => {
        const event = { method: 'POST' }
        vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ gameId: '123', type: 'invalid-type' }))

        await expect(handler(event as any)).rejects.toThrow('Error handling interaction')
    })

    it('should handle like interaction', async () => {
        const event = { method: 'POST' }
        vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ gameId: '123', type: 'like' }))

        const res = await handler(event as any)
        expect(res).toEqual({ success: true })
        expect(mockExecute).toHaveBeenCalledWith(
            'UPDATE games SET upvote = upvote + 1 WHERE id = ?',
            [123]
        )
    })

    it('should handle dislike interaction', async () => {
        const event = { method: 'POST' }
        vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ gameId: 456, type: 'dislike' }))

        const res = await handler(event as any)
        expect(res).toEqual({ success: true })
        expect(mockExecute).toHaveBeenCalledWith(
            'UPDATE games SET downvote = downvote + 1 WHERE id = ?',
            [456]
        )
    })

    it('should handle report interaction', async () => {
        const event = { method: 'POST' }
        vi.stubGlobal('readBody', vi.fn().mockResolvedValue({ gameId: '789', type: 'report' }))

        const res = await handler(event as any)
        expect(res).toEqual({ success: true })
        expect(mockExecute).toHaveBeenCalledWith(
            `INSERT INTO action_logs (user_id, username, user_role, action_type, object_type, object_id, object_name, details)\n                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                0,
                'Guest',
                'guest',
                'report',
                'game',
                789,
                'Game #789',
                'Reported from IP: 127.0.0.1'
            ]
        )
    })
})
