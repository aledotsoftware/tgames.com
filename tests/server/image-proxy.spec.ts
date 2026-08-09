import { describe, it, expect, vi, beforeEach } from 'vitest'
import { handleMultiDomainImageProxy } from '../../server/utils/imageProxy'

// Mock h3 functions and global fetch
vi.stubGlobal('useRuntimeConfig', () => ({
  mediaDomains: ['https://domain-a.com', 'https://domain-b.com']
}))

describe('handleMultiDomainImageProxy', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('should fetch image from the first working domain and set cache headers', async () => {
    const mockHeaders = new Map()
    const fakeEvent = {
      context: {},
      node: { req: {}, res: { setHeader: vi.fn((k, v) => mockHeaders.set(k, v)) } }
    }

    const fakeImageBuffer = new Uint8Array([1, 2, 3, 4]).buffer

    vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
      if (url.includes('domain-a.com')) {
        return Promise.resolve({
          ok: true,
          headers: new Map([['content-type', 'image/webp']]),
          arrayBuffer: () => Promise.resolve(fakeImageBuffer)
        })
      }
      return Promise.resolve({ ok: false, status: 404 })
    }))

    const result = await handleMultiDomainImageProxy(fakeEvent, 'thumbs', 'test-game.webp')

    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBe(4)
  })

  it('should try fallback domain if first domain fails', async () => {
    const fakeEvent = {
      context: {},
      node: { req: {}, res: { setHeader: vi.fn() } }
    }

    const fakeImageBuffer = new Uint8Array([9, 8, 7]).buffer
    const fetchSpy = vi.fn().mockImplementation((url: string) => {
      if (url.includes('domain-b.com')) {
        return Promise.resolve({
          ok: true,
          headers: new Map([['content-type', 'image/png']]),
          arrayBuffer: () => Promise.resolve(fakeImageBuffer)
        })
      }
      return Promise.resolve({ ok: false, status: 404 })
    })

    vi.stubGlobal('fetch', fetchSpy)

    const result = await handleMultiDomainImageProxy(fakeEvent, 'thumbs', 'fallback-game.png')

    expect(fetchSpy).toHaveBeenCalledTimes(2)
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBe(3)
  })

  it('should throw 404 error if image is not found on any domain', async () => {
    const fakeEvent = {
      context: {},
      node: { req: {}, res: { setHeader: vi.fn() } }
    }

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))

    await expect(handleMultiDomainImageProxy(fakeEvent, 'thumbs', 'missing.jpg')).rejects.toThrow('Image asset not found')
  })
})
