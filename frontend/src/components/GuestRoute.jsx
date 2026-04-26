import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAuthRedirectPath } from '../routes'

export default function GuestRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const redirectPath = getAuthRedirectPath(location.state?.from)

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet context={{ redirectPath }} />
}
