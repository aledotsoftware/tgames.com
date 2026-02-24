import { useDB } from '../../utils/db'

export default defineCachedEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const lang = query.lang || 'es'
        const page = parseInt(query.page as string) || 1
        const limit = parseInt(query.limit as string) || 60
        const offset = (page - 1) * limit

        const db = useDB()

        const [rows] = await db.query(
            `SELECT g.id, g.slug, g.thumb_1, g.thumb_2, g.thumb_small, 
                    COALESCE(t.translation, g.title) as title
             FROM games g
             LEFT JOIN translations t ON t.content_id = g.id AND t.content_type = 'game' AND t.field = 'title' AND t.language = ?
             WHERE g.published = 1 
             ORDER BY g.upvote DESC, g.views DESC 
             LIMIT ? OFFSET ?`,
            [lang, limit, offset]
        )

        return {
            success: true,
            games: rows
        }
    } catch (error: unknown) {
        console.error('API Error /api/games:', error)
        const message = error instanceof Error ? error.message : 'Unknown error'
        throw createError({
            statusCode: 500,
            statusMessage: 'Database Error: ' + message
        })
    }
}, {
    base: 'redis',
    name: 'games-catalog',
    getKey: (event) => {
        const query = getQuery(event)
        const lang = query.lang || 'es'
        const page = query.page || '1'
        const limit = query.limit || '60'
        return `trending-${lang}-p${page}-l${limit}`
    },
    maxAge: 60 * 60, // 1 hour TTL Cache!
    swr: true // Serve stale while revalidating
})
