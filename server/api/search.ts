import { useDB } from '../utils/db'

export default defineCachedEventHandler(async (event) => {
    const query = getQuery(event)
    const q = query.q as string

    if (!q || q.length < 2) {
        return { success: true, games: [] }
    }

    try {
        const db = useDB()
        // Optimized: Use prefix search ('query%') to leverage the idx_games_title index.
        // This changes complexity from O(N) full-table scan to O(log N) index range scan.
        const [rows] = await db.query(
            `SELECT id, title, slug, thumb_small, thumb_1 
       FROM games 
       WHERE title LIKE ? AND published = 1 
       LIMIT 10`,
            [`${q}%`]
        )

        return {
            success: true,
            games: rows
        }
    } catch (error: unknown) {
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        }
    }
}, {
    base: 'redis',
    name: 'search',
    getKey: (event) => {
        const query = getQuery(event)
        return `search-${query.q || ''}-${query.lang || 'es'}`
    },
    maxAge: 60 * 60, // 1 hour TTL
    swr: true
})
