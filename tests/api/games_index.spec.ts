import { describe, it, expect, vi, beforeEach } from 'vitest'

// We no longer need to mock globals here since they are in setup.ts
// Just need to mock the specifics of how they respond for this test.
// Wait, defineCachedEventHandler from setup.ts is:
// global.defineCachedEventHandler = vi.fn((handler) => handler)
// Let's modify tests/setup.ts to match what we need.

// Import the handler
import gamesIndexHandler from '../../server/api/games/index'
import * as dbUtils from '../../server/utils/db'

// Mock the db utility
vi.mock('../../server/utils/db', () => ({
    useDB: vi.fn()
}))

describe('API Error Handling - /api/games/index', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    // Clear mocks before each test
    vi.clearAllMocks()
    // Spy on console.error to keep test output clean and verify it's called
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    // Set default getQuery
    vi.mocked(global.getQuery).mockReturnValue({ lang: 'en', page: '1', limit: '60' })
  })

  it('should handle database errors and throw a 500 error', async () => {
    // 1. Arrange
    const errorMessage = 'Connection failed'
    const mockQuery = vi.fn().mockRejectedValue(new Error(errorMessage))

    // Setup our db mock to throw when query is called
    vi.mocked(dbUtils.useDB).mockReturnValue({
        query: mockQuery
    } as any)

    const mockEvent = {} as any

    // 2. Act & Assert
    try {
        await gamesIndexHandler(mockEvent)
        // If the handler didn't throw, fail the test
        expect(true).toBe(false)
    } catch (error: any) {
        // 3. Assert on the error response
        expect(error.statusCode).toBe(500)
        expect(error.statusMessage).toBe(`Database Error: ${errorMessage}`)

        // Ensure console.error was called for logging
        expect(consoleErrorSpy).toHaveBeenCalledWith('API Error /api/games:', expect.any(Error))
    }
  })

  it('should handle non-Error objects thrown by the database', async () => {
    // 1. Arrange
    const stringError = 'Something weird happened'
    const mockQuery = vi.fn().mockRejectedValue(stringError)

    vi.mocked(dbUtils.useDB).mockReturnValue({
        query: mockQuery
    } as any)

    const mockEvent = {} as any

    // 2. Act & Assert
    try {
        await gamesIndexHandler(mockEvent)
        expect(true).toBe(false)
    } catch (error: any) {
        // 3. Assert on the error response
        expect(error.statusCode).toBe(500)
        expect(error.statusMessage).toBe(`Database Error: ${stringError}`)

        // Ensure console.error was called for logging
        expect(consoleErrorSpy).toHaveBeenCalledWith('API Error /api/games:', stringError)
    }
  })
})
