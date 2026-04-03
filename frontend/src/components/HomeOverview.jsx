export default function HomeOverview({
  onOpenDashboard,
  onOpenCollection,
}) {
  return (
    <section className="home-grid">
      <div className="home-hero home-hero-centered">
        <div className="home-hero-copy-wrap home-hero-copy-compact">
          <span className="eyebrow">Registrador pessoal</span>
          <h1>Organize seus livros.</h1>
        </div>

        <div className="home-actions home-actions-centered">
          <button type="button" className="secondary-button home-secondary-action" onClick={onOpenDashboard}>
            Ver painel
          </button>
          <button type="button" className="home-primary-action" onClick={onOpenCollection}>
            Abrir minha colecao
          </button>
        </div>
      </div>
    </section>
  )
}
