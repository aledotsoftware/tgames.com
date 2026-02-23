import { useDB } from '../../utils/db'

export default defineEventHandler(async (event) => {
    const slug = getRouterParam(event, 'slug')

    try {
        const db = useDB()
        const [rows]: any = await db.execute(
            `SELECT * FROM games WHERE slug = ? AND published = 1 LIMIT 1`,
            [slug]
        )

        if (!rows || rows.length === 0) {
            throw createError({ statusCode: 404, statusMessage: 'Juego no encontrado' })
        }

        return {
            success: true,
            game: rows[0]
        }
    } catch (error: any) {
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message
        })
    }
})
