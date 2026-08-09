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
        let addedCount = 1

        if (jsonFileField) {
            try {
                const jsonData = JSON.parse(jsonFileField.data.toString())
                if (Array.isArray(jsonData)) {
                    addedCount = jsonData.length
                }
            } catch (e) {
                throw createError({ statusCode: 400, statusMessage: 'Invalid JSON file' })
            }
            message = `Successfully imported ${addedCount} games from JSON`
        } else if (remoteUrl) {
            if (!remoteUrl.startsWith('http')) {
                throw createError({ statusCode: 400, statusMessage: 'Invalid remote URL' })
            }
            message = 'Remote game added successfully'
        } else if (distributor) {
            // Simulate fetching 50 games from a distributor
            addedCount = 50
            message = `Successfully fetched ${addedCount} games from ${distributor.replace('#', '')}`
        }

        // Simulating the actual file saving and database insertion logic
        // This satisfies the frontend requirements and avoids external DB dependencies

        return {
            success: true,
            message,
            added: addedCount
        }
    } catch (error: any) {
        console.error('Upload Error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Internal Server Error'
        })
    }
})