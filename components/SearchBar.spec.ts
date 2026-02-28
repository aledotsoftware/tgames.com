import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from './SearchBar.vue'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {}
  }
})

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    global.$fetch = vi.fn().mockResolvedValue({ success: true, games: [{ id: 1, title: 'Test Game', slug: 'test-game' }] })
  })

  it('renders correctly', () => {
    const wrapper = mount(SearchBar, {
      global: {
        plugins: [i18n],
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          }
        },
        mocks: {
          $t: (key: string) => key,
          useLocalePath: () => (path: string) => `/en${path}`
        },
        directives: {
          'click-outside': {}
        }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('clears results when query is empty or just whitespace', async () => {
    const wrapper = mount(SearchBar, {
      global: {
        plugins: [i18n],
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          }
        },
        mocks: {
          $t: (key: string) => key,
          useLocalePath: () => (path: string) => `/en${path}`
        },
        directives: {
          'click-outside': {}
        }
      }
    })

    // Set a query and wait for fetch
    const input = wrapper.find('input')
    await input.setValue('test')
    vi.advanceTimersByTime(300)
    await wrapper.vm.$nextTick()

    // Check results are populated
    expect(global.$fetch).toHaveBeenCalled()
    expect(wrapper.vm.results.length).toBe(1)

    // Now set query to empty spaces
    const mockFetch = vi.fn()
    global.$fetch = mockFetch

    await input.setValue('   ')

    // Results should be cleared immediately, without waiting for timeout
    expect(wrapper.vm.results.length).toBe(0)

    // Also advance timer to verify fetch was not called for the empty query
    vi.advanceTimersByTime(300)
    expect(mockFetch).not.toHaveBeenCalled()
  })
})
