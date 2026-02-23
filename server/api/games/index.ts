import { useDB } from '../../utils/db'

export default defineCachedEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const lang = query.lang || 'es'
        const category = query.category as string | undefined

        const db = useDB()

        let sql = `SELECT g.id, g.slug, g.thumb_1, g.thumb_2, g.thumb_small,
                          COALESCE(t.translation, g.title) as title
                   FROM games g
                   LEFT JOIN translations t ON t.content_id = g.id AND t.content_type = 'game' AND t.field = 'title' AND t.language = ?
                   WHERE g.published = 1`

        const params: any[] = [lang]

        if (category) {
            sql += ` AND g.category = ?`
            params.push(category)
        }

        sql += ` ORDER BY g.upvote DESC, g.views DESC LIMIT 60`

        const [rows] = await db.execute(sql, params)

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
    name: 'games-catalog',
    getKey: (event) => {
        const query = getQuery(event)
        const lang = query.lang || 'es'
        const category = query.category || ''
        return `games-${lang}-${category ? category : 'trending'}`
    },
    maxAge: 60 * 60, // 1 hour TTL Cache!
    swr: true // Serve stale while revalidating
})
