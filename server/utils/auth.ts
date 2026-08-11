import crypto from 'crypto'

/**
 * Base64URL encoding helper
 */
function base64UrlEncode(str: Buffer): string {
  return str
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Generates PKCE code_verifier and code_challenge (S256)
 */
export function generatePKCE() {
  const verifier = base64UrlEncode(crypto.randomBytes(32))
  const challenge = base64UrlEncode(
    crypto.createHash('sha256').update(verifier).digest()
  )
  return { verifier, challenge }
}

/**
 * Generates a random state string for OAuth2 state verification
 */
export function generateState(): string {
  return crypto.randomBytes(16).toString('hex')
}

/**
 * Encrypts user payload into a secure session token
 */
export function createSessionToken(payload: any, secretKey: string): string {
  const dataStr = JSON.stringify(payload)
  const key = crypto.createHash('sha256').update(secretKey).digest()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  
  let encrypted = cipher.update(dataStr, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  const tag = cipher.getAuthTag().toString('hex')

  return `${iv.toString('hex')}:${tag}:${encrypted}`
}

/**
 * Decrypts session token back to user payload
 */
export function verifySessionToken(token: string, secretKey: string): any | null {
  try {
    const parts = token.split(':')
    if (parts.length !== 3) return null

    const [ivHex, tagHex, encryptedHex] = parts
    const key = crypto.createHash('sha256').update(secretKey).digest()
    const iv = Buffer.from(ivHex, 'hex')
    const tag = Buffer.from(tagHex, 'hex')

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return JSON.parse(decrypted)
  } catch (e) {
    return null
  }
}
