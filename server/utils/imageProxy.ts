import { defineEventHandler, getRequestHeader, getQuery, createError, setHeader } from 'h3'

export async function handleMultiDomainImageProxy(event: any, prefix: string, imagePath: string) {
  const config = useRuntimeConfig(event)
  
  // Base list of upstream media domains
  const defaultDomains = ['https://tudexgames.com', 'https://cdn.tudexnetworks.com']
  const envMediaDomains = process.env.MEDIA_DOMAINS
    ? process.env.MEDIA_DOMAINS.split(',').map(d => d.trim()).filter(Boolean)
    : []
  const configuredDomains = config.mediaDomains || []

  // Combine and normalize domains (ensure https:// or http:// prefix)
  const allDomains = Array.from(new Set([...envMediaDomains, ...configuredDomains, ...defaultDomains]))
    .map(domain => domain.startsWith('http://') || domain.startsWith('https://') ? domain : `https://${domain}`)

  // Allow optional query override if explicit domain parameter is provided and allowed
  const query = getQuery(event)
  if (query.domain && typeof query.domain === 'string') {
    const requestedDomain = query.domain.startsWith('http') ? query.domain : `https://${query.domain}`
    if (!allDomains.includes(requestedDomain)) {
      allDomains.unshift(requestedDomain)
    }
  }

  // Also try using incoming request host if present as a fallback domain source
  const host = getRequestHeader(event, 'host')
  const proto = getRequestHeader(event, 'x-forwarded-proto') || 'https'
  if (host) {
    const hostUrl = `${proto}://${host}`
    if (!allDomains.includes(hostUrl)) {
      allDomains.push(hostUrl)
    }
  }

  let lastError: any = null

  // Sequentially try fetching the image asset from configured target domains
  for (const domain of allDomains) {
    try {
      const targetUrl = `${domain.replace(/\/$/, '')}/${prefix.replace(/^\//, '')}/${imagePath.replace(/^\//, '')}`
      
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'TGames-ImageProxy/1.0',
          'Accept': 'image/*,*/*'
        }
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'image/jpeg'
        const arrayBuffer = await response.arrayBuffer()

        // Set aggressive caching headers for static image assets
        setHeader(event, 'Content-Type', contentType)
        setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
        setHeader(event, 'X-Media-Source', domain)

        return Buffer.from(arrayBuffer)
      }
    } catch (err) {
      lastError = err
    }
  }

  throw createError({
    statusCode: 404,
    statusMessage: `Image asset not found in any media domain. ${lastError ? lastError.message : ''}`
  })
}
