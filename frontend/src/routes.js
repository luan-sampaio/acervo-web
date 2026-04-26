export const ROUTES = {
  landing: '/',
  login: '/login',
  dashboard: '/dashboard',
  collection: '/collection',
}

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
