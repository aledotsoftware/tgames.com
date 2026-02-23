import { RuntimeConfig as UserRuntimeConfig, PublicRuntimeConfig as UserPublicRuntimeConfig } from 'nuxt/schema'
import { NuxtModule, ModuleDependencyMeta } from '@nuxt/schema'
  interface SharedRuntimeConfig {
   app: {
      buildId: string,

      baseURL: string,

      buildAssetsDir: string,

      cdnURL: string,
   },

   nitro: {
      envPrefix: string,
   },
  }
  interface SharedPublicRuntimeConfig {
   i18n: {
      baseUrl: string,

      defaultLocale: string,

      rootRedirect: any,

      redirectStatusCode: number,

      skipSettingLocaleOnNavigate: boolean,

      locales: Array<{

      }>,

      detectBrowserLanguage: {
         alwaysRedirect: boolean,

         cookieCrossOrigin: boolean,

         cookieDomain: any,

         cookieKey: string,

         cookieSecure: boolean,

         fallbackLocale: string,

         redirectOn: string,

         useCookie: boolean,
      },

      experimental: {
         localeDetector: string,

         typedPages: boolean,

         typedOptionsAndMessages: boolean,

         alternateLinkCanonicalQueries: boolean,

         devCache: boolean,

         cacheLifetime: any,

         stripMessagesPayload: boolean,

         preload: boolean,

         strictSeo: boolean,

         nitroContextDetection: boolean,

         httpCacheDuration: number,
      },

      domainLocales: {
         en: {
            domain: string,
         },

         es: {
            domain: string,
         },

         it: {
            domain: string,
         },

         ar: {
            domain: string,
         },

         de: {
            domain: string,
         },

         fr: {
            domain: string,
         },

         hi: {
            domain: string,
         },

         ja: {
            domain: string,
         },

         ko: {
            domain: string,
         },

         nl: {
            domain: string,
         },

         pt: {
            domain: string,
         },

         ru: {
            domain: string,
         },

         sv: {
            domain: string,
         },

         tr: {
            domain: string,
         },

         zh: {
            domain: string,
         },
      },
   },
  }
declare module '@nuxt/schema' {
  interface ModuleDependencies {
    ["@nuxtjs/i18n"]?: ModuleDependencyMeta<typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@vite-pwa/nuxt"]?: ModuleDependencyMeta<typeof import("@vite-pwa/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/devtools"]?: ModuleDependencyMeta<typeof import("@nuxt/devtools").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/telemetry"]?: ModuleDependencyMeta<typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
  }
  interface NuxtOptions {
    /**
     * Configuration for `@nuxtjs/i18n`
     */
    ["i18n"]: typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@vite-pwa/nuxt`
     */
    ["pwa"]: typeof import("@vite-pwa/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     */
    ["devtools"]: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     */
    ["telemetry"]: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
  }
  interface NuxtConfig {
    /**
     * Configuration for `@nuxtjs/i18n`
     */
    ["i18n"]?: typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@vite-pwa/nuxt`
     */
    ["pwa"]?: typeof import("@vite-pwa/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     */
    ["devtools"]?: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     */
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    modules?: (undefined | null | false | NuxtModule<any> | string | [NuxtModule | string, Record<string, any>] | ["@nuxtjs/i18n", Exclude<NuxtConfig["i18n"], boolean>] | ["@vite-pwa/nuxt", Exclude<NuxtConfig["pwa"], boolean>] | ["@nuxt/devtools", Exclude<NuxtConfig["devtools"], boolean>] | ["@nuxt/telemetry", Exclude<NuxtConfig["telemetry"], boolean>])[],
  }
  interface RuntimeConfig extends UserRuntimeConfig {}
  interface PublicRuntimeConfig extends UserPublicRuntimeConfig {}
}
declare module 'nuxt/schema' {
  interface ModuleDependencies {
    ["@nuxtjs/i18n"]?: ModuleDependencyMeta<typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@vite-pwa/nuxt"]?: ModuleDependencyMeta<typeof import("@vite-pwa/nuxt").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/devtools"]?: ModuleDependencyMeta<typeof import("@nuxt/devtools").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
    ["@nuxt/telemetry"]?: ModuleDependencyMeta<typeof import("@nuxt/telemetry").default extends NuxtModule<infer O> ? O | false : Record<string, unknown>> | false
  }
  interface NuxtOptions {
    /**
     * Configuration for `@nuxtjs/i18n`
     * @see https://www.npmjs.com/package/@nuxtjs/i18n
     */
    ["i18n"]: typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@vite-pwa/nuxt`
     * @see https://www.npmjs.com/package/@vite-pwa/nuxt
     */
    ["pwa"]: typeof import("@vite-pwa/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     * @see https://www.npmjs.com/package/@nuxt/devtools
     */
    ["devtools"]: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     * @see https://www.npmjs.com/package/@nuxt/telemetry
     */
    ["telemetry"]: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? O | false : Record<string, any> | false
  }
  interface NuxtConfig {
    /**
     * Configuration for `@nuxtjs/i18n`
     * @see https://www.npmjs.com/package/@nuxtjs/i18n
     */
    ["i18n"]?: typeof import("@nuxtjs/i18n").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@vite-pwa/nuxt`
     * @see https://www.npmjs.com/package/@vite-pwa/nuxt
     */
    ["pwa"]?: typeof import("@vite-pwa/nuxt").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/devtools`
     * @see https://www.npmjs.com/package/@nuxt/devtools
     */
    ["devtools"]?: typeof import("@nuxt/devtools").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    /**
     * Configuration for `@nuxt/telemetry`
     * @see https://www.npmjs.com/package/@nuxt/telemetry
     */
    ["telemetry"]?: typeof import("@nuxt/telemetry").default extends NuxtModule<infer O, unknown, boolean> ? Partial<O> | false : Record<string, any> | false
    modules?: (undefined | null | false | NuxtModule<any> | string | [NuxtModule | string, Record<string, any>] | ["@nuxtjs/i18n", Exclude<NuxtConfig["i18n"], boolean>] | ["@vite-pwa/nuxt", Exclude<NuxtConfig["pwa"], boolean>] | ["@nuxt/devtools", Exclude<NuxtConfig["devtools"], boolean>] | ["@nuxt/telemetry", Exclude<NuxtConfig["telemetry"], boolean>])[],
  }
  interface RuntimeConfig extends SharedRuntimeConfig {}
  interface PublicRuntimeConfig extends SharedPublicRuntimeConfig {}
}
declare module 'vue' {
        interface ComponentCustomProperties {
          $config: UserRuntimeConfig
        }
      }