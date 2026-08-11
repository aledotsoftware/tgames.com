export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  const sessionCookie = getCookie(event, 'tudex_session')

  if (!sessionCookie) {
    return { authenticated: false, user: null }
  }

  const user = verifySessionToken(sessionCookie, config.sessionSecret)
  if (!user) {
    deleteCookie(event, 'tudex_session')
    return { authenticated: false, user: null }
  }

  return {
    authenticated: true,
    user
  }
})
