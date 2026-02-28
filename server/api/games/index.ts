import { useDB } from '../../utils/db'
import { validatePagination } from '../../utils/pagination'

export default defineCachedEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const lang = query.lang || 'es'
        const { limit } = validatePagination(query)

        let cursorStr = typeof query.cursor === 'string' ? query.cursor : null

        const db = useDB()

        let sql = `SELECT g.id, g.slug, g.thumb_1, g.thumb_2, g.thumb_small, g.upvote, g.views,
                    COALESCE(t.translation, g.title) as title
             FROM games g
             LEFT JOIN translations t ON t.content_id = g.id AND t.content_type = 'game' AND t.field = 'title' AND t.language = ?
             WHERE g.published = 1`

        const params: any[] = [lang]

        if (cursorStr) {
            const parts = cursorStr.split('_')
            if (parts.length === 3) {
                const [cUpvote, cViews, cId] = parts.map(Number)
                sql += ` AND (g.upvote, g.views, g.id) < (?, ?, ?)`
                params.push(cUpvote, cViews, cId)
            }
        }

        sql += ` ORDER BY g.upvote DESC, g.views DESC, g.id DESC LIMIT ?`
        params.push(limit)

        const [rows] = await db.query(sql, params) as any

        let nextCursor = null
        if (rows.length === limit) {
            const lastGame = rows[rows.length - 1]
            nextCursor = `${lastGame.upvote}_${lastGame.views}_${lastGame.id}`
        }

        return {
            success: true,
            games: rows,
            nextCursor
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
        const cursorStr = typeof query.cursor === 'string' ? query.cursor : 'first'
        return `trending-${lang}-c${cursorStr}-l${limit}`
    },
    maxAge: 60 * 60, // 1 hour TTL Cache!
    swr: true // Serve stale while revalidating
})
