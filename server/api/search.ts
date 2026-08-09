import { useDB } from '../utils/db.ts'

export default defineCachedEventHandler(async (event) => {
    const query = getQuery(event)
    const rawQ = query.q
    const lang = (query.lang as string) || 'es'
    const q = Array.isArray(rawQ) ? rawQ[0] : rawQ

    // Validate that q is a string and meets minimum length
    if (!q || typeof q !== 'string' || q.trim().length < 2) {
        return { success: true, games: [] }
    }

    const searchTerm = `%${q.trim()}%`

    try {
        const db = useDB()
        const [rows] = await db.query(
            `SELECT g.id, g.slug, g.thumb_small, g.thumb_1, g.category,
                    COALESCE(t.translation, g.title) as title 
             FROM games g
             LEFT JOIN translations t ON t.content_id = g.id AND t.content_type = 'game' AND t.field = 'title' AND t.language = ?
             WHERE (g.title LIKE ? OR t.translation LIKE ?) AND g.published = 1 
             LIMIT 12`,
            [lang, searchTerm, searchTerm]
        )

        return {
            success: true,
            games: rows
        }
    } catch (error: unknown) {
        console.error('Search API Error:', error)
        return {
            success: false,
            games: [],
            error: error instanceof Error ? error.message : String(error)
        }
    }
}, {
    base: 'redis',
    name: 'search',
    getKey: (event) => {
        const query = getQuery(event)
        const q = (query.q || '').toString().trim().toLowerCase()
        const lang = (query.lang || 'es').toString()
        return `search-${q}-${lang}`
    },
    maxAge: 30 * 60,
    swr: true
})
