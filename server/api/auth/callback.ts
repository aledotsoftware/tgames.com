export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)

  const code = query.code as string
  const state = query.state as string
  const error = query.error as string

  if (error) {
    console.error('OIDC Auth Error:', error)
    return sendRedirect(event, '/?auth_error=' + encodeURIComponent(error))
  }

  const savedState = getCookie(event, 'auth_state')
  const codeVerifier = getCookie(event, 'auth_verifier')

  deleteCookie(event, 'auth_state')
  deleteCookie(event, 'auth_verifier')

  if (!code || !state || state !== savedState || !codeVerifier) {
    console.error('OIDC Callback verification failed: invalid state or code verifier')
    return sendRedirect(event, '/?auth_error=state_mismatch')
  }

  const host = getRequestHeader(event, 'host') || 'tudexgames.com'
  const protocol = getRequestHeader(event, 'x-forwarded-proto') || (host.includes('localhost') ? 'http' : 'https')
  const redirectUri = `${protocol}://${host}/api/auth/callback`

  try {
    const tokenBody = new URLSearchParams()
    tokenBody.append('grant_type', 'authorization_code')
    tokenBody.append('client_id', config.oidcClientId)
    tokenBody.append('code', code)
    tokenBody.append('redirect_uri', redirectUri)
    tokenBody.append('code_verifier', codeVerifier)

    const tokenRes = await $fetch<{ access_token: string, id_token?: string }>(`${config.oidcIssuer}/api/oidc/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: tokenBody.toString()
    })

    if (!tokenRes || !tokenRes.access_token) {
      throw new Error('Failed to obtain access token from OIDC provider')
    }

    const userInfo = await $fetch<any>(`${config.oidcIssuer}/api/oidc/userinfo`, {
      headers: {
        'Authorization': `Bearer ${tokenRes.access_token}`
      }
    })

    const userPayload = {
      id: userInfo.sub || userInfo.id,
      name: userInfo.name || userInfo.preferred_username || userInfo.username || 'Usuario',
      email: userInfo.email || '',
      username: userInfo.preferred_username || userInfo.username || userInfo.name || '',
      picture: userInfo.picture || userInfo.avatar_url || ''
    }

    const sessionToken = createSessionToken(userPayload, config.sessionSecret)

    setCookie(event, 'tudex_session', sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 604800 // 7 days
    })

    return sendRedirect(event, '/')
  } catch (err: any) {
    console.error('OIDC Token exchange error:', err)
    return sendRedirect(event, '/?auth_error=' + encodeURIComponent(err.message || 'token_error'))
  }
})
