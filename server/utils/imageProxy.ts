import { defineEventHandler, getRequestHeader, getQuery, createError, setHeader } from 'h3'

export async function handleMultiDomainImageProxy(event: any, prefix: string, imagePath: string) {
  const config = useRuntimeConfig(event)
  
  // Base list of upstream media domains
  const defaultDomains = [
    'https://tudexgames.com',
    'https://cdn.tudexnetworks.com',
    'https://gamemonetize.com',
    'https://html5.gamemonetize.com'
  ]

  const envMediaDomains = process.env.MEDIA_DOMAINS
    ? process.env.MEDIA_DOMAINS.split(',').map(d => d.trim()).filter(Boolean)
    : []
  const configuredDomains = config.mediaDomains || []

  // Normalize image path
  let cleanPath = (imagePath || '').replace(/^\/+/, '')
  if (cleanPath.startsWith('thumbs/')) {
    cleanPath = cleanPath.replace(/^thumbs\//, '')
  } else if (cleanPath.startsWith('games/')) {
    cleanPath = cleanPath.replace(/^games\//, '')
  }

  // Handle absolute URL if passed as path
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    try {
      const response = await fetch(cleanPath, {
        headers: {
          'User-Agent': 'TGames-ImageProxy/1.0',
          'Accept': 'image/*,*/*'
        }
      })
      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'image/jpeg'
        const arrayBuffer = await response.arrayBuffer()
        setHeader(event, 'Content-Type', contentType)
        setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
        return Buffer.from(arrayBuffer)
      }
    } catch (e) {
      // Fall through to domain trial
    }
  }

  // Combine and normalize upstream domains
  const allDomains = Array.from(new Set([...envMediaDomains, ...configuredDomains, ...defaultDomains]))
    .map(domain => domain.startsWith('http://') || domain.startsWith('https://') ? domain : `https://${domain}`)

  // Prevent self-proxy loops by filtering out current request host
  const currentHost = getRequestHeader(event, 'host')
  const targetDomains = allDomains.filter(domain => {
    try {
      const u = new URL(domain)
      return !currentHost || u.host !== currentHost
    } catch (e) {
      return true
    }
  })

  const domainsToTry = targetDomains.length > 0 ? targetDomains : allDomains
  let lastError: any = null

  // Sequentially try fetching from upstream domains
  for (const domain of domainsToTry) {
    try {
      const cleanPrefix = prefix.replace(/^\/+|\/+$/g, '')
      const targetUrl = `${domain.replace(/\/$/, '')}/${cleanPrefix}/${cleanPath}`
      
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'TGames-ImageProxy/1.0',
          'Accept': 'image/*,*/*'
        }
      })

      if (response.ok) {
        const contentType = response.headers.get('content-type') || 'image/jpeg'
        const arrayBuffer = await response.arrayBuffer()

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
    statusMessage: `Image asset not found in media domains. ${lastError ? lastError.message : ''}`
  })
}
