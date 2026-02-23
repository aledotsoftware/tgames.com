import { useDB } from '../../utils/db'

export default defineCachedEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const lang = query.lang || 'es'
        const category = query.category

        if (!category) {
             return {
                success: true,
                games: []
            }
        }

        const db = useDB()

        const [rows] = await db.execute(
            `SELECT g.id, g.slug, g.thumb_1, g.thumb_2, g.thumb_small,
                    COALESCE(t.translation, g.title) as title
             FROM games g
             LEFT JOIN translations t ON t.content_id = g.id AND t.content_type = 'game' AND t.field = 'title' AND t.language = ?
             WHERE g.published = 1
             AND g.category = ?
             ORDER BY g.views DESC
             LIMIT 20`,
            [lang, category]
        )

        return {
            success: true,
            games: rows
        }
    } catch (error: any) {
        console.error('DB Error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error connecting to database: ' + error.message
        })
    }
}, {
    base: 'redis',
    name: 'games-related',
    getKey: (event) => {
        const query = getQuery(event)
        return `related-${query.category || 'none'}-${query.lang || 'es'}`
    },
    maxAge: 60 * 60, // 1 hour
    swr: true
})
