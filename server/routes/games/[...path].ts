import { handleMultiDomainImageProxy } from '../../utils/imageProxy.ts'

export default defineEventHandler(async (event) => {
  const path = event.context.params?.path || ''
  if (!path) {
    throw createError({ statusCode: 400, statusMessage: 'Game path required' })
  }
  return handleMultiDomainImageProxy(event, 'games', path)
})
