import { useDB } from '../utils/db'

export default defineEventHandler(async (event) => {
    if (event.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
    }

    try {
        const body = await readBody(event)
        const { gameId, type } = body

        if (!gameId || !type) {
            throw createError({ statusCode: 400, statusMessage: 'Missing parameters' })
        }

        const db = useDB()

        if (type === 'like') {
            await db.execute(`UPDATE games SET upvote = upvote + 1 WHERE id = ?`, [gameId])
        } else if (type === 'dislike') {
            await db.execute(`UPDATE games SET downvote = downvote + 1 WHERE id = ?`, [gameId])
        } else if (type === 'report') {
            // Placeholder since there isn't an explicit "bug_reports" table, just log for now
            console.log(`[Report Bug] Game ID ${gameId} was reported!`)
        } else {
            throw createError({ statusCode: 400, statusMessage: 'Invalid interaction type' })
        }

        return {
            success: true
        }

    } catch (error: any) {
        console.error('Interaction API Error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: 'Error handling interaction'
        })
    }
})
