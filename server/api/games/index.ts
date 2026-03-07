import { useDB } from '../../utils/db'

export default defineCachedEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const lang = query.lang || 'es'
        const sort = query.sort || 'top_rated'

        let orderBy = 'ORDER BY g.upvote DESC, g.views DESC'
        switch(sort) {
            case 'newest':
                orderBy = 'ORDER BY g.createddate DESC'
                break
            case 'most_viewed':
                orderBy = 'ORDER BY g.views DESC'
                break
            case 'top_rated':
                orderBy = 'ORDER BY g.upvote DESC'
                break
        }

        const db = useDB()

        const [rows] = await db.execute(
            `SELECT g.id, g.slug, g.thumb_1, g.thumb_2, g.thumb_small, 
                    COALESCE(t.translation, g.title) as title
             FROM games g
             LEFT JOIN translations t ON t.content_id = g.id AND t.content_type = 'game' AND t.field = 'title' AND t.language = ?
             WHERE g.published = 1 
             ${orderBy}
             LIMIT 60`,
            [lang]
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
    name: 'games-catalog',
    getKey: (event) => {
        const query = getQuery(event)
        return `trending-${query.lang || 'es'}-${query.sort || 'top_rated'}`
    },
    maxAge: 60 * 60, // 1 hour TTL Cache!
    swr: true // Serve stale while revalidating
})
