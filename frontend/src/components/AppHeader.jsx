export default function AppHeader({ currentView, onNavigate }) {
  return (
    <header className="app-header">
      <div className="app-brand">
        <span className="app-brand-mark">ML</span>
        <div>
          <strong>Meus Livros</strong>
          <span>Painel pessoal de acervo</span>
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
          Colecao
        </button>
      </nav>
    </header>
  )
}
