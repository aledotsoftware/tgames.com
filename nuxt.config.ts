import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxtjs/i18n'
  ],

  i18n: {
    lazy: true,
    langDir: 'locales/',
    strategy: 'prefix',
    defaultLocale: 'es',
    locales: [
      { code: 'en', file: 'en.json' },
      { code: 'es', file: 'es.json' },
      { code: 'it', file: 'it.json' },
      { code: 'ar', file: 'ar.json' },
      { code: 'zh', file: 'zh.json' },
      { code: 'de', file: 'de.json' },
      { code: 'fr', file: 'fr.json' },
      { code: 'hi', file: 'hi.json' },
      { code: 'ja', file: 'ja.json' },
      { code: 'ko', file: 'ko.json' },
      { code: 'nl', file: 'nl.json' },
      { code: 'pt', file: 'pt.json' },
      { code: 'ru', file: 'ru.json' },
      { code: 'sv', file: 'sv.json' },
      { code: 'tr', file: 'tr.json' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    }
  },

  app: {
    head: {
      title: 'Tudex Games - Llegar y Jugar',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&family=Inter:wght@400;500;600&display=swap' }
      ]
    }
  },

  nitro: {
    storage: {
      cache: {
        driver: 'redis',
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      },
      redis: {
        driver: 'redis',
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      }
    }
  },

  routeRules: {
    '/thumbs/**': { proxy: 'https://tudexgames.com/thumbs/**' },
    '/games/**': { proxy: 'https://tudexgames.com/games/**' }
  },

  compatibilityDate: '2024-04-03'
})
