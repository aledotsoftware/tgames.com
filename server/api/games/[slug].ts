import { useDB } from '../../utils/db'

export default defineCachedEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')

    try {
        const query = getQuery(event)
        const lang = query.lang || 'es'

        const db = useDB()
        const [rows]: any = await db.query(
            `SELECT g.*, 
                    COALESCE(t1.translation, g.title) as title,
                    COALESCE(t2.translation, g.description) as description,
                    COALESCE(t3.translation, g.instructions) as instructions
             FROM games g
             LEFT JOIN translations t1 ON t1.content_id = g.id AND t1.content_type = 'game' AND t1.field = 'title' AND t1.language = ?
             LEFT JOIN translations t2 ON t2.content_id = g.id AND t2.content_type = 'game' AND t2.field = 'description' AND t2.language = ?
             LEFT JOIN translations t3 ON t3.content_id = g.id AND t3.content_type = 'game' AND t3.field = 'instructions' AND t3.language = ?
             WHERE g.slug = ? AND g.published = 1 
             LIMIT 1`,
            [lang, lang, lang, slug]
        )

        if (!rows || rows.length === 0) {
            throw createError({ statusCode: 404, statusMessage: 'Juego no encontrado' })
        }

        return {
            success: true,
            game: rows[0]
        }
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message
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
    maxAge: 60 * 60, // 1 hour
    swr: true
})
