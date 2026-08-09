import { defineNuxtConfig } from 'nuxt/config'

// Multi-domain image configuration:
// Reads IMAGE_DOMAINS from env (comma separated) or falls back to default list
const defaultDomains = [
  'tudexgames.com',
  '*.tudexgames.com',
  'tudexnetworks.com',
  '*.tudexnetworks.com',
  'localhost',
  '127.0.0.1'
]

const envDomains = process.env.IMAGE_DOMAINS
  ? process.env.IMAGE_DOMAINS.split(',').map(d => d.trim()).filter(Boolean)
  : []

const imageDomains = Array.from(new Set([...defaultDomains, ...envDomains]))

// Multi-domain media fallback sources for server routes:
const defaultMediaDomains = [
  'https://tudexgames.com',
  'https://cdn.tudexnetworks.com'
]

const envMediaDomains = process.env.MEDIA_DOMAINS
  ? process.env.MEDIA_DOMAINS.split(',').map(d => d.trim()).filter(Boolean)
  : []

const mediaDomains = Array.from(new Set([...envMediaDomains, ...defaultMediaDomains]))

export default defineNuxtConfig({
  srcDir: '.',
  devtools: { enabled: false },
  css: ['~/assets/css/main.css'],

  modules: [
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
    '@nuxt/image'
  ],

  image: {
    domains: imageDomains,
    alias: {
      '/thumbs': '/thumbs',
      '/games': '/games'
    }
  },

  pwa: {
    manifest: {
      name: 'tudexgames',
      short_name: 'tudexgames',
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
    langDir: 'i18n/locales',
    strategy: 'prefix',
    defaultLocale: 'es',
    locales: [
      { code: 'en', name: 'English', file: 'en.json' },
      { code: 'es', name: 'Español', file: 'es.json' },
      { code: 'it', name: 'Italiano', file: 'it.json' },
      { code: 'ar', name: 'العربية', file: 'ar.json' },
      { code: 'de', name: 'Deutsch', file: 'de.json' },
      { code: 'fr', name: 'Français', file: 'fr.json' },
      { code: 'hi', name: 'हिन्दी', file: 'hi.json' },
      { code: 'ja', name: '日本語', file: 'ja.json' },
      { code: 'ko', name: '한국어', file: 'ko.json' },
      { code: 'nl', name: 'Nederlands', file: 'nl.json' },
      { code: 'pt', name: 'Português', file: 'pt.json' },
      { code: 'ru', name: 'Русский', file: 'ru.json' },
      { code: 'sv', name: 'Svenska', file: 'sv.json' },
      { code: 'tr', name: 'Türkçe', file: 'tr.json' },
      { code: 'zh', name: '中文', file: 'zh.json' }
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'es'
    }
  },

  runtimeConfig: {
    database: {
      host: process.env.DB_HOST || 'db',
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      pass: process.env.DB_PASS,
      name: process.env.DB_NAME || 'tudexgames'
    },
    redisUrl: process.env.REDIS_URL || 'redis://redis:6379',
    imageDomains,
    mediaDomains
  },

  app: {
    head: {
      title: 'tudexgames - Llegar y Jugar',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Comfortaa:wght@400;700&family=Inter:wght@400;500;600&display=swap' }
      ],
      script: [
        { src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9896533792719232', crossorigin: 'anonymous', async: true },
        { src: 'https://www.googletagmanager.com/gtag/js?id=G-WS88X834MF', async: true },
        { innerHTML: 'window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag(\'js\', new Date());\ngtag(\'config\', \'G-WS88X834MF\');' }
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
    '/': { prerender: true },
    '/game/**': { swr: 3600 },
    '/**': { isr: true }
  },

  compatibilityDate: '2024-04-03'
})
