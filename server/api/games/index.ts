import { useGamesCollection, applyTranslation } from '../../utils/mongo'
import { validatePagination } from '../../utils/pagination'

export default defineCachedEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const lang = (query.lang as string) || 'es'
        const { limit } = validatePagination(query)
        const cursorParam = query.cursor as string

        const games = await useGamesCollection()

        const filter: any = { published: 1 }

        // Cursor-based pagination: (upvote, views, id) tuple
        if (cursorParam) {
            const parts = cursorParam.split('_')
            if (parts.length === 3) {
                const cUpvote = parseInt(parts[0])
                const cViews = parseInt(parts[1])
                const cId = parseInt(parts[2])

                filter.$or = [
                    { upvote: { $lt: cUpvote } },
                    { upvote: cUpvote, views: { $lt: cViews } },
                    { upvote: cUpvote, views: cViews, id: { $lt: cId } }
                ]
            }
        }

        const docs = await games
            .find(filter, {
                projection: {
                    id: 1, slug: 1, thumb_1: 1, thumb_2: 1, thumb_small: 1,
                    upvote: 1, views: 1, title: 1,
                    [`i18n.${lang}`]: 1
                }
            })
            .sort({ upvote: -1, views: -1, id: -1 })
            .limit(limit)
            .toArray()

        const result = docs.map(doc => applyTranslation(doc, lang))

        return {
            success: true,
            games: result
        }
    } catch (error: unknown) {
        console.error('API Error /api/games:', error)
        const errorMessage = error instanceof Error ? error.message : String(error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Database Error: ' + errorMessage
        })
    }
}, {
    base: 'redis',
    name: 'games-catalog',
    getKey: (event) => {
        const query = getQuery(event)
        const lang = query.lang || 'es'
        const { limit } = validatePagination(query)
        const cursor = query.cursor || '0'
        return `trending-${lang}-c${cursor}-l${limit}`
    },
    maxAge: 60 * 60,
    swr: true
})
