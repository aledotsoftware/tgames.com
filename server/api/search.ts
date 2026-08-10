import { useGamesCollection, applyTranslation } from '../utils/mongo'

export default defineCachedEventHandler(async (event) => {
    const query = getQuery(event)
    const rawQ = query.q
    const lang = (query.lang as string) || 'es'
    const q = Array.isArray(rawQ) ? rawQ[0] : rawQ

    if (!q || typeof q !== 'string' || q.trim().length < 2) {
        return { success: true, games: [] }
    }

    const searchTerm = q.trim()
    const regex = new RegExp(searchTerm, 'i')

    try {
        const games = await useGamesCollection()

        const docs = await games
            .find(
                {
                    published: 1,
                    $or: [
                        { title: regex },
                        { [`i18n.${lang}.title`]: regex }
                    ]
                },
                {
                    projection: {
                        id: 1, slug: 1, thumb_small: 1, thumb_1: 1, category: 1, title: 1,
                        [`i18n.${lang}.title`]: 1
                    }
                }
            )
            .limit(12)
            .toArray()

        return {
            success: true,
            games: docs.map(doc => applyTranslation(doc, lang))
        }
    } catch (error: unknown) {
        console.error('Search API Error:', error)
        return {
            success: false,
            games: [],
            error: error instanceof Error ? error.message : String(error)
        }
    }
}, {
    base: 'redis',
    name: 'search',
    getKey: (event) => {
        const query = getQuery(event)
        const q = (query.q || '').toString().trim().toLowerCase()
        const lang = (query.lang || 'es').toString()
        return `search-${q}-${lang}`
    },
    maxAge: 30 * 60,
    swr: true
})
