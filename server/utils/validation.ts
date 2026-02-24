export const ALLOWED_LOCALES = ['en', 'es', 'it', 'ar', 'de', 'fr', 'hi', 'ja', 'ko', 'nl', 'pt', 'ru', 'sv', 'tr', 'zh']

export function getValidLang(lang: any): string {
    if (typeof lang === 'string' && ALLOWED_LOCALES.includes(lang)) {
        return lang
    }
    return 'es'
}
