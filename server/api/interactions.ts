import { useDB } from '../utils/db'

// Write-behind buffer for interactions
const interactionBuffer = new Map<number, { likes: number, dislikes: number }>()
const FLUSH_INTERVAL_MS = 5000

let isFlushing = false
let flushInterval: NodeJS.Timeout | null = null

async function flushInteractions() {
    if (isFlushing || interactionBuffer.size === 0) return

    isFlushing = true
    const db = useDB()

    // Create a snapshot of the buffer and clear it
    const snapshot = new Map(interactionBuffer)
    interactionBuffer.clear()

    try {
        for (const [id, counts] of snapshot.entries()) {
            if (counts.likes > 0 && counts.dislikes > 0) {
                await db.execute(
                    `UPDATE games SET upvote = upvote + ?, downvote = downvote + ? WHERE id = ?`,
                    [counts.likes, counts.dislikes, id]
                )
            } else if (counts.likes > 0) {
                await db.execute(
                    `UPDATE games SET upvote = upvote + ? WHERE id = ?`,
                    [counts.likes, id]
                )
            } else if (counts.dislikes > 0) {
                await db.execute(
                    `UPDATE games SET downvote = downvote + ? WHERE id = ?`,
                    [counts.dislikes, id]
                )
            }
        }
    } catch (error) {
        console.error('Error flushing interactions:', error)
        // Note: in a production scenario, we might want to put failed updates back into the buffer
        // but for this simple optimization, we'll log the error.
    } finally {
        isFlushing = false
    }
}

// Start the flush interval if it's not already running
if (!flushInterval) {
    flushInterval = setInterval(flushInteractions, FLUSH_INTERVAL_MS)
}

function bufferInteraction(gameId: number, type: 'like' | 'dislike') {
    const current = interactionBuffer.get(gameId) || { likes: 0, dislikes: 0 }
    if (type === 'like') {
        current.likes++
    } else {
        current.dislikes++
    }
    interactionBuffer.set(gameId, current)
}

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

        if (type === 'like' || type === 'dislike') {
            bufferInteraction(id, type)
        } else if (type === 'report') {
            const ip = getRequestIP(event, { xForwardedFor: true }) || 'Unknown'

            await db.execute(
                `INSERT INTO action_logs (user_id, username, user_role, action_type, object_type, object_id, object_name, details)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    0,
                    'Guest',
                    'guest',
                    'report',
                    'game',
                    id,
                    `Game #${id}`,
                    `Reported from IP: ${ip}`
                ]
            )
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
