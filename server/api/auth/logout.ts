export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  deleteCookie(event, 'tudex_session')

  const endSessionUrl = `${config.oidcIssuer}/api/oidc/end-session`
  return sendRedirect(event, endSessionUrl)
})
