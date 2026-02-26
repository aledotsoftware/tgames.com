import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from './SearchBar.vue'

// Since we are running in the 'nuxt' environment provided by @nuxt/test-utils,
// the actual Nuxt plugins (including i18n) try to initialize.
// However, full i18n initialization might be tricky in this test environment or fail if config is missing.
//
// We will mock the composables directly to bypass the complex plugin logic.
// We need to be careful to mock them in a way that overrides what the nuxt environment provides.

// Mocking #imports usually works for auto-imported composables in Nuxt
vi.mock('#imports', async () => {
    return {
        // We can try to keep other things if needed, but for now let's just mock what we need
        useI18n: () => ({
            locale: { value: 'en' },
            t: (key) => key
        }),
        useLocalePath: () => (path) => `/en${path}`
    }
})

// Depending on how SearchBar imports useI18n, we might need to mock vue-i18n too.
// The component uses `const { locale } = useI18n()`.
// If it imports from 'vue-i18n', we need this:
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: { value: 'en' },
    t: (key) => key
  }),
  createI18n: () => ({}) // Adding createI18n to satisfy the error seen in logs if something tries to use it
}))


describe('SearchBar.vue', () => {
  let wrapper
  // Mock global $fetch
  const mockFetch = vi.fn()

  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('$fetch', mockFetch)
    mockFetch.mockReset()

    // Default mock implementation to return success so it doesn't crash the component
    mockFetch.mockResolvedValue({ success: true, games: [] })

    wrapper = mount(SearchBar, {
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          },
          Transition: {
            template: '<div><slot /></div>',
            inheritAttrs: false
          }
        },
        mocks: {
           $t: (msg) => msg
        },
        directives: {
            'click-outside': {
                mounted: (el, binding) => {
                    el.clickOutsideEvent = (event) => {
                        if (!(el === event.target || el.contains(event.target))) {
                            binding.value(event);
                        }
                    };
                    document.addEventListener("click", el.clickOutsideEvent);
                },
                unmounted: (el) => {
                    document.removeEventListener("click", el.clickOutsideEvent);
                }
            }
        }
      }
    })
  })

  afterEach(() => {
    if (wrapper) wrapper.unmount()
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('debounces search input', async () => {
    const input = wrapper.find('input')

    // Type 'test'
    await input.setValue('test')

    // Timer hasn't advanced enough (200ms < 300ms)
    vi.advanceTimersByTime(200)
    expect(mockFetch).not.toHaveBeenCalled()

    // Type more 'test game'
    await input.setValue('test game')

    // Timer hasn't advanced enough since last input (200ms < 300ms)
    vi.advanceTimersByTime(200)
    expect(mockFetch).not.toHaveBeenCalled()

    // Advance timer past debounce threshold (total 350ms > 300ms)
    vi.advanceTimersByTime(150)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    // Check if the fetch was called with the correct URL
    // The component does: `/api/search?q=${encodeURIComponent(query.value)}&lang=${locale.value}`
    expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('q=test%20game'))
  })

  it('clears results when input is empty', async () => {
    const input = wrapper.find('input')

    // First make a search to potentially populate results (mocking logic if we could check internal state easily)
    await input.setValue('something')
    vi.advanceTimersByTime(300)
    expect(mockFetch).toHaveBeenCalledTimes(1)
    mockFetch.mockClear()

    // Clear input
    await input.setValue('  ')

    // Wait for potential debounce if it were not guarded
    vi.advanceTimersByTime(300)

    // Should NOT search again because of the trim check
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('displays results after successful search', async () => {
    // Mock successful response
    const mockResponse = {
      success: true,
      games: [
        { id: 1, title: 'Super Game', slug: 'super-game', thumb_small: 'thumb.jpg' },
        { id: 2, title: 'Mega Game', slug: 'mega-game', thumb_small: 'thumb2.jpg' }
      ]
    }

    mockFetch.mockResolvedValue(mockResponse)

    const input = wrapper.find('input')
    await input.setValue('game')

    // Trigger debounce
    vi.advanceTimersByTime(300)

    // Wait for promise resolution and DOM update
    // We need to wait for the microtask queue to clear since fetch is async
    await vi.waitFor(async () => {
        await wrapper.vm.$nextTick()
        // Check if results container is rendered
        const items = wrapper.findAll('.premium-search-item')
        expect(items.length).toBe(2)
        expect(items[0].text()).toContain('Super Game')
    })
  })
})
