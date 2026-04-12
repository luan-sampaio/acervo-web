import { Navigate, Outlet } from 'react-router-dom'
import AppHeader from './AppHeader'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
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
