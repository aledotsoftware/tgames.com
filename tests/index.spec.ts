import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import IndexPage from '../pages/index.vue'
import { defineComponent, h, Suspense, ref } from 'vue'

describe('pages/index.vue', () => {
    let intersectionObserverMock: any
    let observeMock: any
    let disconnectMock: any

    beforeEach(() => {
        observeMock = vi.fn()
        disconnectMock = vi.fn()
        intersectionObserverMock = vi.fn(function(this: any, callback) {
            this.observe = observeMock
            this.disconnect = disconnectMock
            this._trigger = callback // for manually triggering intersection
        })
        vi.stubGlobal('IntersectionObserver', intersectionObserverMock)

        // Mock useFetch correctly with reactive wrapper
        const useFetchMock = vi.fn(() => ({
            data: ref({ games: [{ id: 1, title: 'Game 1', slug: 'game-1' }] }),
            pending: ref(false),
            error: ref(null)
        }))
        vi.stubGlobal('useFetch', useFetchMock)

        vi.stubGlobal('useI18n', vi.fn(() => ({ locale: ref('es'), t: vi.fn((key) => key) })))
        vi.stubGlobal('useLocalePath', vi.fn(() => vi.fn((path) => path)))
        vi.stubGlobal('useHead', vi.fn())
        vi.stubGlobal('useSeoMeta', vi.fn())
        vi.stubGlobal('useRuntimeConfig', vi.fn(() => ({ public: {} })))

        vi.stubGlobal('useRoute', vi.fn(() => ({ path: '/' })))

        // Reset fetch mock
        if (global.$fetch) {
            const fetchMock = global.$fetch as any
            if (fetchMock.mockClear) {
                fetchMock.mockClear()
            }
        }
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    const mountComponent = async (errorData = null) => {
        if (errorData) {
            vi.stubGlobal('useFetch', vi.fn(() => ({
                data: ref(null),
                pending: ref(false),
                error: ref(errorData)
            })))
        }

        const SuspenseWrapper = defineComponent({
            components: { IndexPage },
            render() {
                return h(Suspense, null, {
                    default: () => h(IndexPage)
                })
            }
        })
        const wrapper = mount(SuspenseWrapper, {
            global: {
                mocks: {
                    $t: (msg: string) => msg
                },
                stubs: {
                    NuxtLink: true,
                    SkeletonGameCard: true,
                }
            }
        })
        await flushPromises()
        return wrapper
    }

    it('mounts properly and observes the sentinel element', async () => {
        const wrapper = await mountComponent()

        expect(wrapper.exists()).toBe(true)
        expect(intersectionObserverMock).toHaveBeenCalled()
        expect(observeMock).toHaveBeenCalled()
    })

    it('displays an error message if fetch fails', async () => {
        const wrapper = await mountComponent({ message: 'Failed to load' })
        expect(wrapper.text()).toContain('error_catalog Failed to load')
    })

    it('triggers loadMoreGames when sentinel intersects', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ games: [{ id: 2, title: 'Game 2', slug: 'game-2' }] })
        vi.stubGlobal('$fetch', fetchMock)

        const wrapper = await mountComponent()

        // Find observer instance
        const observerInstance = intersectionObserverMock.mock.instances[0]

        // Trigger intersection manually
        observerInstance._trigger([{ isIntersecting: true }])

        await flushPromises()

        // Check if $fetch was called for the next page
        expect(fetchMock).toHaveBeenCalledWith('/api/games', {
            query: { lang: 'es', cursor: 'undefined_undefined_1' } // since upvote and views aren't mocked in initial games
        })
    })

    it('stops fetching when hasMore is false', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ games: [] })
        vi.stubGlobal('$fetch', fetchMock)

        const wrapper = await mountComponent()

        const observerInstance = intersectionObserverMock.mock.instances[0]

        // Trigger intersection
        observerInstance._trigger([{ isIntersecting: true }])
        await flushPromises()

        // 1st call from intersection
        expect(fetchMock).toHaveBeenCalledTimes(1)

        // Trigger intersection again
        observerInstance._trigger([{ isIntersecting: true }])
        await flushPromises()

        // Should not fetch again because hasMore should be false
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('disconnects the observer when unmounted', async () => {
        const wrapper = await mountComponent()
        wrapper.unmount()
        expect(disconnectMock).toHaveBeenCalled()
    })
})
