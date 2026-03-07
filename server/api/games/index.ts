import { useDB } from '../../utils/db'
import { validatePagination } from '../../utils/pagination'

export default defineCachedEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const lang = query.lang || 'es'
        const { limit } = validatePagination(query)
        const cursorParam = query.cursor as string

        const db = useDB()

        let sql = `
            SELECT g.id, g.slug, g.thumb_1, g.thumb_2, g.thumb_small, g.upvote, g.views,
                   COALESCE(t.translation, g.title) as title
            FROM games g
            LEFT JOIN translations t ON t.content_id = g.id AND t.content_type = 'game' AND t.field = 'title' AND t.language = ?
            WHERE g.published = 1
        `
        const params: any[] = [lang]

        if (cursorParam) {
            const parts = cursorParam.split('_')
            if (parts.length === 3) {
                const cUpvote = parseInt(parts[0])
                const cViews = parseInt(parts[1])
                const cId = parseInt(parts[2])

                sql += ` AND (g.upvote < ? OR (g.upvote = ? AND g.views < ?) OR (g.upvote = ? AND g.views = ? AND g.id < ?)) `
                params.push(cUpvote, cUpvote, cViews, cUpvote, cViews, cId)
            }
        }

        sql += ` ORDER BY g.upvote DESC, g.views DESC, g.id DESC LIMIT ?`
        params.push(limit)

        const [rows] = await db.query(sql, params)

        return {
            success: true,
            games: rows
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
    maxAge: 60 * 60, // 1 hour TTL Cache!
    swr: true // Serve stale while revalidating
})
