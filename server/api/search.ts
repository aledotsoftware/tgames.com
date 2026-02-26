import { useDB } from '../utils/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const q = query.q as string

    if (!q || q.length < 2) {
        return { success: true, games: [] }
    }

    try {
        const db = useDB()
        // Perform simple Like search over game title for fast results natively
        const [rows] = await db.query(
            `SELECT id, title, slug, thumb_small, thumb_1 
       FROM games 
       WHERE title LIKE ? AND published = 1 
       LIMIT 10`,
            [`%${q}%`]
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
})
