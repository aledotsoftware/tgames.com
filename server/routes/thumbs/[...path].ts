import { handleMultiDomainImageProxy } from '../../utils/imageProxy.ts'

export default defineEventHandler(async (event) => {
  const path = event.context.params?.path || ''
  if (!path) {
    throw createError({ statusCode: 400, statusMessage: 'Image path required' })
  }
  return handleMultiDomainImageProxy(event, 'thumbs', path)
})
