import { vi } from 'vitest'

// Create a global stub for defineCachedEventHandler which Nuxt provides automatically
global.defineCachedEventHandler = (handler: any, options: any) => {
    // Return a wrapped function that behaves like the event handler
    const wrapper = async (event: any) => {
        return await handler(event)
    }
    // Attach options to make them accessible for testing if needed
    wrapper.__options = options
    return wrapper
}

global.getQuery = vi.fn()
