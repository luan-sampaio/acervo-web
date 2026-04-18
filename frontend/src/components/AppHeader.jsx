import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AppHeader() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="app-header">
      <div className="app-brand">
        <span className="app-brand-mark" aria-hidden="true">
          <span className="app-brand-mark-book" />
          <span className="app-brand-mark-page" />
        </span>
        <div className="app-brand-copy">
          <strong>Acervo</strong>
          <span>Registro pessoal de acervo</span>
        </div>
      </div>

      <nav className="app-nav" aria-label="Navegacao principal">
        <NavLink
          to="/collection"
          className={({ isActive }) => (isActive ? 'app-nav-link app-nav-link-active' : 'app-nav-link')}
        >
          Coleção
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'app-nav-link app-nav-link-active' : 'app-nav-link')}
        >
          Painel
        </NavLink>
      </nav>

      <div className="app-header-user">
        {user ? <span className="app-header-email">{user.email}</span> : null}
        <button type="button" className="app-logout-button" onClick={handleLogout}>
          Sair
        </button>
      </div>
    </header>
  )
}
