export default defineEventHandler(async (event) => {
    if (event.method !== 'POST') {
        throw createError({ statusCode: 405, statusMessage: 'Method Not Allowed' })
    }

    try {
        const formData = await readMultipartFormData(event)

        if (!formData || formData.length === 0) {
            throw createError({ statusCode: 400, statusMessage: 'No files uploaded' })
        }

        // Find specific fields
        const distributorField = formData.find(f => f.name === 'distributor')
        const gameFileField = formData.find(f => f.name === 'gameFile')
        const jsonFileField = formData.find(f => f.name === 'jsonFile')
        const remoteUrlField = formData.find(f => f.name === 'remoteUrl')

        const distributor = distributorField ? distributorField.data.toString() : null
        const remoteUrl = remoteUrlField ? remoteUrlField.data.toString() : null

        let message = 'Game uploaded successfully'
        if (jsonFileField) {
            message = 'JSON imported successfully'
        } else if (remoteUrl) {
            message = 'Remote game added successfully'
        } else if (distributor) {
            message = 'Game fetched from distributor successfully'
        }

        // Simulating the actual file upload logic for now
        // Usually, we would parse formData, save files, update DB, etc.

        return {
            success: true,
            message
        }
    } catch (error: any) {
        console.error('Upload Error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Internal Server Error'
        })
    }
})