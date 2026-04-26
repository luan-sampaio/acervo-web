export const ROUTES = {
  landing: '/',
  login: '/login',
  dashboard: '/dashboard',
  collection: '/collection',
}

const AUTH_REDIRECT_ROUTES = new Set([
  ROUTES.dashboard,
  ROUTES.collection,
])

export const LOGIN_MODE = {
  login: 'login',
  register: 'register',
}

export function getLoginRoute(mode = LOGIN_MODE.login) {
  if (mode === LOGIN_MODE.register) {
    return `${ROUTES.login}?mode=${LOGIN_MODE.register}`
  }

  return ROUTES.login
}

function getSafeLocationPart(value, prefix) {
  if (typeof value !== 'string') {
    return ''
  }

  if (!value) {
    return ''
  }

  return value.startsWith(prefix) ? value : ''
}

export function getAuthRedirectPath(from) {
  const pathname = getSafeLocationPart(from?.pathname, '/')

  if (!AUTH_REDIRECT_ROUTES.has(pathname)) {
    return ROUTES.dashboard
  }

  const search = getSafeLocationPart(from?.search, '?')
  const hash = getSafeLocationPart(from?.hash, '#')

  return `${pathname}${search}${hash}`
}
