import { Navigate, Outlet, useLocation } from 'react-router-dom'
import AppHeader from './AppHeader'
import { useAuth } from '../context/AuthContext'
import { ROUTES } from '../routes'

export default function PrivateRoute() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="container">
        <Outlet />
      </main>
    </div>
  )
}
