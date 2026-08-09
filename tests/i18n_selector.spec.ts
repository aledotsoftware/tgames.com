import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AppVue from '../app.vue'
import { defineComponent, h, Suspense, ref } from 'vue'

describe('app.vue Language Selector Persistence', () => {
  let setLocaleMock: any
  let setLocaleCookieMock: any
  let localeRef: any

  beforeEach(() => {
    localeRef = ref('es')
    setLocaleMock = vi.fn((newLang: string) => {
      localeRef.value = newLang
      return Promise.resolve()
    })
    setLocaleCookieMock = vi.fn()

    vi.stubGlobal('useI18n', vi.fn(() => ({
      locale: localeRef,
      locales: ref([
        { code: 'es', name: 'Español' },
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'Français' }
      ]),
      setLocale: setLocaleMock,
      setLocaleCookie: setLocaleCookieMock
    })))

    vi.stubGlobal('useLocalePath', vi.fn(() => vi.fn((path) => path)))
    vi.stubGlobal('useSwitchLocalePath', vi.fn(() => vi.fn((lang) => `/${lang}`)))
    vi.stubGlobal('navigateTo', vi.fn())

    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {}
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value.toString() },
        clear: () => { store = {} }
      }
    })()
    vi.stubGlobal('localStorage', localStorageMock)
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  const mountApp = async () => {
    const SuspenseWrapper = defineComponent({
      components: { AppVue },
      render() {
        return h(Suspense, null, {
          default: () => h(AppVue)
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
          NuxtPage: true,
          SearchBar: true
        }
      }
    })
    await flushPromises()
    return wrapper
  }

  it('renders locale options correctly with names', async () => {
    const wrapper = await mountApp()
    const select = wrapper.find('select.premium-lang-select')
    expect(select.exists()).toBe(true)

    const options = select.findAll('option')
    expect(options.length).toBe(3)
    expect(options[0].text()).toBe('Español (ES)')
    expect(options[1].text()).toBe('English (EN)')
    expect(options[2].text()).toBe('Français (FR)')
  })

  it('invokes setLocale, setLocaleCookie, and saves to localStorage on language change', async () => {
    const wrapper = await mountApp()
    const select = wrapper.find('select.premium-lang-select')

    await select.setValue('en')
    await flushPromises()

    expect(setLocaleCookieMock).toHaveBeenCalledWith('en')
    expect(setLocaleMock).toHaveBeenCalledWith('en')
    expect(localStorage.getItem('i18n_locale')).toBe('en')
  })
})
