import { NavLink } from 'react-router-dom'

export default function AppHeader() {
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
          to="/"
          end
          className={({ isActive }) => (isActive ? 'app-nav-link app-nav-link-active' : 'app-nav-link')}
        >
          Inicio
        </NavLink>
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
    </header>
  )
}
