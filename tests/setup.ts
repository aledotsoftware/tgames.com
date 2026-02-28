import { config } from '@vue/test-utils'
import { vi } from 'vitest'

config.global.stubs = {
  NuxtLink: true,
  NuxtImg: true,
  SkeletonGameCard: true,
  Suspense: false,
}

config.global.mocks = {
    $t: (key: string) => key
}

// Mock Nuxt globals
vi.stubGlobal('useI18n', () => ({
  locale: { value: 'es' },
  t: (key: string) => key
}))
vi.stubGlobal('useLocalePath', () => (path: string) => path)
vi.stubGlobal('useSeoMeta', vi.fn())

const useFetchMock = vi.fn(() => ({
  data: { value: { games: [{ id: 1, title: 'Game 1', slug: 'game-1' }] } },
  pending: { value: false },
  error: { value: null }
}))
vi.stubGlobal('useFetch', useFetchMock)

const fetchMock = vi.fn(() => Promise.resolve({ games: [] }))
vi.stubGlobal('$fetch', fetchMock)
