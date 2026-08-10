import { useGamesCollection, applyTranslation } from '../../utils/mongo'

export default defineCachedEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')

    try {
        const query = getQuery(event)
        const lang = (query.lang as string) || 'es'

        const games = await useGamesCollection()
        const doc = await games.findOne(
            { slug, published: 1 },
            {
                projection: {
                    id: 1, slug: 1, title: 1, description: 1, instructions: 1,
                    category: 1, source: 1, game_type: 1, url: 1,
                    thumb_1: 1, thumb_2: 1, thumb_small: 1,
                    width: 1, height: 1, tags: 1,
                    views: 1, upvote: 1, downvote: 1,
                    is_mobile: 1, is_premium: 1, published: 1,
                    [`i18n.${lang}`]: 1
                }
            }
        )

        if (!doc) {
            throw createError({ statusCode: 404, statusMessage: 'Juego no encontrado' })
        }

        return {
            success: true,
            game: applyTranslation(doc, lang)
        }
    } catch (error: unknown) {
        const statusCode = (typeof error === 'object' && error !== null && 'statusCode' in error) ? (error as { statusCode: number }).statusCode : 500
        const message = error instanceof Error ? error.message : 'Unknown error'
        throw createError({
            statusCode,
            statusMessage: message
        })
    }
}, {
    base: 'redis',
    name: 'game-details',
    getKey: (event) => {
        const slug = getRouterParam(event, 'slug')
        const query = getQuery(event)
        const lang = query.lang || 'es'
        return `game-${slug}-${lang}`
    },
    maxAge: 60 * 60,
    swr: true
})
