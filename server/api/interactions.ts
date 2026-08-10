import { useGamesCollection, useBugReportsCollection } from '../utils/mongo'

// Write-behind buffer for interactions
const interactionBuffer = new Map<number, { likes: number, dislikes: number }>()
const FLUSH_INTERVAL_MS = 5000

let isFlushing = false
let flushInterval: NodeJS.Timeout | null = null

async function flushInteractions() {
    if (isFlushing || interactionBuffer.size === 0) return

    isFlushing = true
    const games = await useGamesCollection()

    const snapshot = new Map(interactionBuffer)
    interactionBuffer.clear()

    try {
        const promises = []
        for (const [id, counts] of snapshot.entries()) {
            const inc: any = {}
            if (counts.likes > 0) inc.upvote = counts.likes
            if (counts.dislikes > 0) inc.downvote = counts.dislikes
            if (Object.keys(inc).length > 0) {
                promises.push(games.updateOne({ id }, { $inc: inc }))
            }
        }
        await Promise.all(promises)
    } catch (error) {
        console.error('Error flushing interactions:', error)
    } finally {
        isFlushing = false
    }
}

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

        if (type === 'like' || type === 'dislike') {
            bufferInteraction(id, type)
        } else if (type === 'report') {
            const bugReports = await useBugReportsCollection()
            await bugReports.insertOne({ game_id: id, created_at: new Date() })
        }

        return { success: true }

    } catch (error: unknown) {
        console.error('Interaction API Error:', error)
        const statusCode = (typeof error === 'object' && error !== null && 'statusCode' in error) ? (error as { statusCode: number }).statusCode : 500
        throw createError({
            statusCode,
            statusMessage: 'Error handling interaction'
        })
    }
})
