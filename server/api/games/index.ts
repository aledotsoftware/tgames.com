import { useDB } from '../../utils/db'
console.log('GAMES API LOADED');

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const lang = query.lang || 'es'
        const page = parseInt(query.page as string) || 1
        const limit = parseInt(query.limit as string) || 60
        const offset = (page - 1) * limit

        const db = useDB()

        const [rows] = await db.execute('SELECT 1 as test')

        return {
            success: true,
            games: rows
        }
    } catch (error: any) {
        console.error('DB Error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Error connecting to database: ' + error.message
        })
    }
})
