import { useDB } from '../utils/db'

export default defineEventHandler(async (event) => {
    const query = getQuery(event)
    const rawQ = query.q
    // Handle array case by taking the first element
    const q = Array.isArray(rawQ) ? rawQ[0] : rawQ

    // Validate that q is a string and meets minimum length
    if (!q || typeof q !== 'string' || q.length < 2) {
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
    } catch (error: any) {
        return {
            success: false,
            error: error.message
        }
    }
})
