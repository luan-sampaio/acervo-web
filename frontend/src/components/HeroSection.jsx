export default function HeroSection({ totalBooks, totalBooksLabel, latestAdditionLabel }) {
  return (
    <section className="hero-card">
      <div className="hero-copy">
        <span className="eyebrow">Acervo</span>
        <h1>Acervo</h1>
        <p>Gerencie seu acervo com rapidez e simplicidade.</p>
      </div>

      <div className="hero-stats">
        <div className="stat-card">
          <strong>{totalBooks}</strong>
          <span>{totalBooksLabel}</span>
        </div>
        <div className="stat-card">
          <strong>Última adição</strong>
          <span>{latestAdditionLabel}</span>
        </div>
      </div>
    </section>
  )
}
