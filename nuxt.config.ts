import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt'
  ],

  pwa: {
    manifest: {
      name: 'Tudex Games',
      short_name: 'TudexGames',
      description: 'Llegar y Jugar - Plataforma de juegos web rápida y minimalista.',
      theme_color: '#000000',
      background_color: '#000000',
      icons: [
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/[a-z]{2}(\/|$)/, /^\/$/]
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },

  i18n: {
    lazy: false,
    langDir: '',
    strategy: 'prefix',
    defaultLocale: 'es',
    vueI18n: '~/i18n/i18n.config.ts',
    locales: [
      { code: 'en', file: '~/i18n/locales/en.json' },
      { code: 'es', file: '~/i18n/locales/es.json' },
      { code: 'it', file: '~/i18n/locales/it.json' },
      { code: 'ar', file: '~/i18n/locales/ar.json' },
      { code: 'de', file: '~/i18n/locales/de.json' },
      { code: 'fr', file: '~/i18n/locales/fr.json' },
      { code: 'hi', file: '~/i18n/locales/hi.json' },
      { code: 'ja', file: '~/i18n/locales/ja.json' },
      { code: 'ko', file: '~/i18n/locales/ko.json' },
      { code: 'nl', file: '~/i18n/locales/nl.json' },
      { code: 'pt', file: '~/i18n/locales/pt.json' },
      { code: 'ru', file: '~/i18n/locales/ru.json' },
      { code: 'sv', file: '~/i18n/locales/sv.json' },
      { code: 'tr', file: '~/i18n/locales/tr.json' },
      { code: 'zh', file: '~/i18n/locales/zh.json' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false
    }
  },

  runtimeConfig: {
    database: {
      host: process.env.DB_HOST || 'db',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      pass: process.env.DB_PASS || 'root',
      name: process.env.DB_NAME || 'tudexgames'
    },
    redisUrl: process.env.REDIS_URL || 'redis://redis:6379'
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
