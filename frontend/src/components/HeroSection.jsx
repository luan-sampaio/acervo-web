export default function HeroSection({ totalBooks, totalBooksLabel, latestAdditionLabel }) {
  return (
    <section className="hero-card">
      <span className="eyebrow">Book Registry</span>
      <h1>Cadastre e acompanhe sua coleção de livros</h1>
      <p>
        Uma interface simples para registrar títulos e visualizar rapidamente
        o acervo salvo na API FastAPI.
      </p>
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
