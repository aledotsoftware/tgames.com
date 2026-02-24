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

        const id = Number(gameId)
        if (!Number.isInteger(id) || id <= 0) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid game ID' })
        }

        const allowedTypes = ['like', 'dislike', 'report']
        if (!allowedTypes.includes(type)) {
            throw createError({ statusCode: 400, statusMessage: 'Invalid interaction type' })
        }

        const db = useDB()

        if (type === 'like') {
            await db.execute(`UPDATE games SET upvote = upvote + 1 WHERE id = ?`, [id])
        } else if (type === 'dislike') {
            await db.execute(`UPDATE games SET downvote = downvote + 1 WHERE id = ?`, [id])
        } else if (type === 'report') {
            // Placeholder since there isn't an explicit "bug_reports" table, just log for now
            console.log(`[Report Bug] Game ID ${id} was reported!`)
        }

        return {
            success: true
        }

    } catch (error: unknown) {
        console.error('Interaction API Error:', error)
        const statusCode = (typeof error === 'object' && error !== null && 'statusCode' in error) ? (error as { statusCode: number }).statusCode : 500
        throw createError({
            statusCode,
            statusMessage: 'Error handling interaction'
        })
    }
})
