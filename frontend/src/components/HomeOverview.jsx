export default function HomeOverview({ onOpenCollection }) {
  return (
    <section className="home-grid">
      <div className="home-hero home-hero-centered">
        <div className="home-hero-copy-wrap home-hero-copy-compact">
          <span className="eyebrow">Registrador pessoal</span>
          <h1>Organize seus livros.</h1>
        </div>

        <button type="button" className="home-primary-action" onClick={onOpenCollection}>
          Abrir minha coleção
        </button>
      </div>
    </section>
  )
}
