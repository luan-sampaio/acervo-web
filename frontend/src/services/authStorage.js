export const TOKEN_KEY = 'acervo_token'
export const USER_KEY = 'acervo_user'
export const AUTH_UNAUTHORIZED_EVENT = 'acervo:unauthorized'

export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export function dispatchUnauthorizedEvent() {
  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
}
