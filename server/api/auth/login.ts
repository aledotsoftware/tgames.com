export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const { verifier, challenge } = generatePKCE()
  const state = generateState()

  setCookie(event, 'auth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600
  })

  setCookie(event, 'auth_verifier', verifier, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600
  })

  const host = getRequestHeader(event, 'host') || 'tudexgames.com'
  const protocol = getRequestHeader(event, 'x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const redirectUri = `${protocol}://${host}/api/auth/callback`

  const authUrl = new URL(`${config.oidcIssuer}/authorize`)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', config.oidcClientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', 'openid profile email')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('code_challenge', challenge)
  authUrl.searchParams.set('code_challenge_method', 'S256')

  return sendRedirect(event, authUrl.toString())
})
