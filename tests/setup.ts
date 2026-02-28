import { vi } from 'vitest'

global.defineEventHandler = (handler: any) => handler
global.readBody = vi.fn() as any
global.createError = ((err: any) => {
    const error = new Error(err.statusMessage)
    Object.assign(error, err)
    return error
}) as any
global.getRequestIP = vi.fn(() => '127.0.0.1') as any
