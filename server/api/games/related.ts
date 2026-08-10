import { useGamesCollection, applyTranslation } from '../../utils/mongo'

export default defineCachedEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const lang = (query.lang as string) || 'es'
        const category = query.category as string

        if (!category) {
            return { success: true, games: [] }
        }

        const games = await useGamesCollection()

        const docs = await games
            .find(
                { published: 1, category },
                {
                    projection: {
                        id: 1, slug: 1, thumb_1: 1, thumb_2: 1, thumb_small: 1, title: 1,
                        [`i18n.${lang}.title`]: 1
                    }
                }
            )
            .sort({ views: -1 })
            .limit(20)
            .toArray()

        return {
            success: true,
            games: docs.map(doc => applyTranslation(doc, lang))
        }
    } catch (error: unknown) {
        console.error('DB Error:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        throw createError({
            statusCode: 500,
            statusMessage: 'Error connecting to database: ' + message
        })
    }
}, {
    base: 'redis',
    name: 'games-related',
    getKey: (event) => {
        const query = getQuery(event)
        return `related-${query.category || 'none'}-${query.lang || 'es'}`
    },
    maxAge: 60 * 60,
    swr: true
})
