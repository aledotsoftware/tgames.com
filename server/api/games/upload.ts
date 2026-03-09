export default defineEventHandler(async (event) => {
    if (event.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
    }

    try {
        const formData = await readMultipartFormData(event)

        if (!formData || formData.length === 0) {
            throw createError({ statusCode: 400, statusMessage: 'No files uploaded' })
        }

        // Simulating the actual file upload logic for now
        // Usually, we would parse formData, save files, update DB, etc.

        return {
            success: true,
            message: 'Game uploaded successfully'
        }
    } catch (error: any) {
        console.error('Upload Error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Internal Server Error'
        })
    }
})