export default function AppHeader({ currentView, onNavigate }) {
  return (
    <header className="app-header">
      <div className="app-brand">
        <span className="app-brand-mark" aria-hidden="true">
          <span className="app-brand-mark-book" />
          <span className="app-brand-mark-page" />
        </span>
        <div className="app-brand-copy">
          <strong>Meus Livros</strong>
          <span>Registro pessoal de acervo</span>
        </div>
      </div>

      <nav className="app-nav" aria-label="Navegacao principal">
        <button
          type="button"
          className={currentView === 'home' ? 'app-nav-link app-nav-link-active' : 'app-nav-link'}
          onClick={() => onNavigate('home')}
        >
          Inicio
        </button>
        <button
          type="button"
          className={currentView === 'collection' ? 'app-nav-link app-nav-link-active' : 'app-nav-link'}
          onClick={() => onNavigate('collection')}
        >
          Coleção
        </button>
        <button
          type="button"
          className={currentView === 'dashboard' ? 'app-nav-link app-nav-link-active' : 'app-nav-link'}
          onClick={() => onNavigate('dashboard')}
        >
          Painel
        </button>
      </nav>
    </header>
  )
}
