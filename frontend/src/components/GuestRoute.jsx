import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function getRedirectPath(state) {
  const from = state?.from
  const path = `${from?.pathname ?? ''}${from?.search ?? ''}${from?.hash ?? ''}`

  return path || '/dashboard'
}

export default function GuestRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const redirectPath = getRedirectPath(location.state)

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet context={{ redirectPath }} />
}
