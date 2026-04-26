import { Navigate, Route, Routes } from 'react-router-dom'
import GuestRoute from './components/GuestRoute'
import PrivateRoute from './components/PrivateRoute'
import CollectionPage from './pages/CollectionPage'
import DashboardPage from './pages/DashboardPage'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import { ROUTES } from './routes'

export default function App() {
  return (
    <Routes>
      <Route path={ROUTES.landing} element={<LandingPage />} />

      <Route element={<GuestRoute />}>
        <Route path={ROUTES.login} element={<LoginPage />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path={ROUTES.collection} element={<CollectionPage />} />
        <Route path={ROUTES.dashboard} element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to={ROUTES.landing} replace />} />
    </Routes>
  )
}
