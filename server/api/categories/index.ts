import { useDB } from '../../utils/db'

export default defineCachedEventHandler(async (event) => {
    try {
        const db = useDB()

        const [rows] = await db.execute(
            `SELECT DISTINCT category FROM games WHERE published = 1 ORDER BY category ASC`
        )

        // Process rows to get a clean list of unique categories
        // Assuming category column contains single values. If they are comma separated, we might need more processing.
        // For now, based on inspection, they seem to be single values.
        const categories = (rows as any[]).map(r => r.category).filter(c => c && c.trim() !== '')

        return {
            success: true,
            categories
        }
    } catch (error: any) {
        console.error('DB Error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching categories: ' + error.message
        })
    }
}, {
    base: 'redis',
    name: 'categories-list',
    maxAge: 60 * 60 * 24, // 24 hours
    swr: true
})
