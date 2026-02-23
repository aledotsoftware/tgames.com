import { useDB } from '../../utils/db'

export default defineCachedEventHandler(async (event) => {
    try {
        const db = useDB()

        // Fetch top trending / new games (limit to 60 for fast initial render)
        // We only select the fields required for the catalog view mapping "game-thumb", "title", "slug"
        const [rows] = await db.execute(
            `SELECT id, title, slug, thumb_1, thumb_2, thumb_small 
       FROM games 
       WHERE published = 1 
       ORDER BY upvote DESC, views DESC 
       LIMIT 60`
        )

        return {
            success: true,
            games: rows
        }
    } catch (error: any) {
        console.error('DB Error:', error)

        // Throw error so Nitro unstorage doesn't cache failed db states
        throw createError({
            statusCode: 500,
            statusMessage: 'Error connecting to database: ' + error.message
        })
    }
}, {
    base: 'redis',
    name: 'games-catalog',
    getKey: () => 'trending',
    maxAge: 60 * 60, // 1 hour TTL Cache!
    swr: true // Serve stale while revalidating
})
