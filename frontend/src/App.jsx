import { Navigate, Route, Routes } from 'react-router-dom'
import AppHeader from './components/AppHeader'
import CollectionPage from './pages/CollectionPage'
import DashboardPage from './pages/DashboardPage'
import HomePage from './pages/HomePage'

export default function App() {
  return (
    <div className="app-shell">
      <AppHeader />

      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
