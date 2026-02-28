import { describe, it, expect, vi } from 'vitest'
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
import IndexPage from '../pages/index.vue'

// Mock useI18n and useLocalePath globally for Nuxt
mockNuxtImport('useI18n', () => {
  return () => ({
    locale: ref('en'),
    t: (key: string) => key === 'error_catalog' ? 'Unable to load games at this time:' : key,
  })
})

mockNuxtImport('useLocalePath', () => {
  return () => (path: string) => path
})

mockNuxtImport('useSeoMeta', () => {
  return () => {}
})

mockNuxtImport('useFetch', () => {
  return async (url: string, options?: any) => {
    if (url === '/api/games') {
      if (globalThis.fetchError) {
         return {
          data: ref(null),
          pending: ref(false),
          error: ref({ message: 'Fetch failed' })
        }
      }
      return {
        data: ref({
          games: [
            { id: 1, slug: 'game-1', title: 'Game 1', thumb_small: 'thumb1.jpg' },
            { id: 2, slug: 'game-2', title: 'Game 2', thumb_small: 'thumb2.jpg' },
          ]
        }),
        pending: ref(false),
        error: ref(null)
      }
    }
    return { data: ref(null), pending: ref(false), error: ref(null) }
  }
})

describe('IndexPage', () => {
  it('renders games on success', async () => {
    globalThis.fetchError = false

    // Mount component
    const wrapper = await mountSuspended(IndexPage, {
      global: {
        stubs: {
          NuxtLink: true,
          NuxtImg: true,
          SkeletonGameCard: true,
        },
      },
    })

    // Assert games are rendered
    const gameCards = wrapper.findAll('.game-card')
    expect(gameCards.length).toBe(2)
  })

  it('renders error state on failure', async () => {
    globalThis.fetchError = true

    const wrapper = await mountSuspended(IndexPage, {
      global: {
        stubs: {
          NuxtLink: true,
          NuxtImg: true,
          SkeletonGameCard: true,
        },
      },
    })

    const errorState = wrapper.find('.error-state')
    expect(errorState.exists()).toBe(true)
    expect(errorState.text()).toContain('Unable to load games at this time:')
    expect(errorState.text()).toContain('Fetch failed')
  })
})
