import { getRequestHeader, createError, setHeader } from 'h3'
import { useGamesCollection } from './mongo'

async function fetchWithTimeout(url: string, timeoutMs = 3000): Promise<Response | null> {
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    })
    if (response.ok) return response
  } catch (e) {
    // Ignore timeout or network errors
  }
  return null
}

export async function handleMultiDomainImageProxy(event: any, prefix: string, imagePath: string) {
  const config = useRuntimeConfig(event)

  // Normalize image path
  let cleanPath = (imagePath || '').replace(/^\/+/, '')
  if (cleanPath.startsWith('thumbs/')) {
    cleanPath = cleanPath.replace(/^thumbs\//, '')
  } else if (cleanPath.startsWith('games/')) {
    cleanPath = cleanPath.replace(/^games\//, '')
  }

  // 1. Handle direct absolute URLs
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    const res = await fetchWithTimeout(cleanPath, 4000)
    if (res) {
      const contentType = res.headers.get('content-type') || 'image/jpeg'
      const arrayBuffer = await res.arrayBuffer()
      setHeader(event, 'Content-Type', contentType)
      setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
      return Buffer.from(arrayBuffer)
    }
  }

  // 2. Smart provider resolution from MongoDB
  const filename = cleanPath.split('/').pop() || ''
  const cleanName = filename.replace(/\.(webp|jpg|png|jpeg|gif)$/i, '')
  const slugCandidate = cleanName
    .replace(/([_-]\d+|[_-]small|[_-]medium|[_-]large|[_-]512x384|[_-]\d+x\d+)$/i, '')
    .replace(/([_-]small|[_-]medium)$/i, '')

  if (cleanName) {
    try {
      const games = await useGamesCollection()
      const game = await games.findOne({
        $or: [
          { slug: slugCandidate },
          { thumb_1: { $regex: cleanName, $options: 'i' } },
          { thumb_2: { $regex: cleanName, $options: 'i' } },
          { thumb_small: { $regex: cleanName, $options: 'i' } }
        ]
      }, { projection: { url: 1, thumb_1: 1, slug: 1 } })

      if (game && game.url) {
        const urlsToTry: string[] = []

        // GameMonetize
        if (game.url.includes('gamemonetize')) {
          const hashMatch = game.url.match(/gamemonetize\.(com|co)\/([a-z0-9]+)/i)
          if (hashMatch && hashMatch[2]) {
            const hash = hashMatch[2]
            urlsToTry.push(`https://img.gamemonetize.com/${hash}/512x384.jpg`)
            urlsToTry.push(`https://img.gamemonetize.com/${hash}/512x384.png`)
            urlsToTry.push(`https://img.gamemonetize.com/${hash}/200x150.jpg`)
          }
        }

        // GamePix
        if (game.url.includes('gamepix')) {
          const gamepixMatch = game.url.match(/gamepix\.com\/([^\/]+)/i)
          if (gamepixMatch && gamepixMatch[1]) {
            const gSlug = gamepixMatch[1]
            urlsToTry.push(`https://img.gamepix.com/games/${gSlug}/cover/${gSlug}.png`)
            urlsToTry.push(`https://img.gamepix.com/games/${gSlug}/icon/${gSlug}.png`)
            urlsToTry.push(`https://img.gamepix.com/games/${gSlug}/banner/${gSlug}.png`)
          }
        }

        // HTMLGames
        if (game.url.includes('htmlgames')) {
          const htmlgamesMatch = game.url.match(/cdn\.htmlgames\.com\/([^\/]+)/i)
          if (htmlgamesMatch && htmlgamesMatch[1]) {
            const folder = htmlgamesMatch[1]
            urlsToTry.push(`https://cdn.htmlgames.com/${folder}/img/icon/image-300x200.jpg`)
          }
        }

        for (const targetUrl of urlsToTry) {
          const res = await fetchWithTimeout(targetUrl, 3000)
          if (res) {
            const contentType = res.headers.get('content-type') || 'image/jpeg'
            const arrayBuffer = await res.arrayBuffer()
            setHeader(event, 'Content-Type', contentType)
            setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
            setHeader(event, 'X-Media-Source', targetUrl)
            return Buffer.from(arrayBuffer)
          }
        }
      }
    } catch (err) {
      // Fall through to domain list
    }
  }

  // 3. Fallback domain trial
  const defaultDomains = [
    'https://img.gamemonetize.com',
    'https://img.gamepix.com',
    'https://cdn.htmlgames.com'
  ]

  const envMediaDomains = process.env.MEDIA_DOMAINS
    ? process.env.MEDIA_DOMAINS.split(',').map(d => d.trim()).filter(Boolean)
    : []
  const configuredDomains = config.mediaDomains || []

  const allDomains = Array.from(new Set([...envMediaDomains, ...configuredDomains, ...defaultDomains]))
    .map(domain => domain.startsWith('http://') || domain.startsWith('https://') ? domain : `https://${domain}`)

  const cleanPrefix = prefix.replace(/^\/+|\/+$/g, '')

  for (const domain of allDomains) {
    const targetUrl = `${domain.replace(/\/$/, '')}/${cleanPrefix}/${cleanPath}`
    const res = await fetchWithTimeout(targetUrl, 2500)
    if (res) {
      const contentType = res.headers.get('content-type') || 'image/jpeg'
      const arrayBuffer = await res.arrayBuffer()
      setHeader(event, 'Content-Type', contentType)
      setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
      setHeader(event, 'X-Media-Source', domain)
      return Buffer.from(arrayBuffer)
    }
  }

  throw createError({
    statusCode: 404,
    statusMessage: `Image asset not found in media domains.`
  })
}

