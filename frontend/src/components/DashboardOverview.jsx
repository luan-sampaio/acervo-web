import { formatDate } from '../utils'

export default function DashboardOverview({
  totalBooks,
  latestAdditionLabel,
  metrics,
  recentBooks,
  onOpenCollection,
}) {
  return (
    <section className="dashboard-grid">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <span className="eyebrow">Painel do acervo</span>
          <h1>Uma visão rápida da sua coleção.</h1>
          <p>
            Veja o ritmo do seu acervo, acompanhe os registros mais recentes e siga para a
            coleção quando quiser cadastrar ou revisar livros.
          </p>
        </div>

        <div className="dashboard-actions">
          <button type="button" className="home-primary-action" onClick={onOpenCollection}>
            Ir para a coleção
          </button>
        </div>
      </section>

      <section className="dashboard-stats">
        <article className="stat-card dashboard-stat-card">
          <span>Total de livros</span>
          <strong>{totalBooks}</strong>
          <p>{totalBooks === 1 ? '1 livro registrado' : `${totalBooks} livros registrados`}</p>
        </article>

        <article className="stat-card dashboard-stat-card">
          <span>Última adição</span>
          <strong>{latestAdditionLabel}</strong>
          <p>Seu acervo continua em movimento.</p>
        </article>

        <article className="stat-card dashboard-stat-card">
          <span>Favoritos</span>
          <strong>{metrics.favoriteCount}</strong>
          <p>Livros marcados para voltar sempre.</p>
        </article>

        <article className="stat-card dashboard-stat-card">
          <span>Lendo agora</span>
          <strong>{metrics.readingNowCount}</strong>
          <p>Leituras atualmente em andamento.</p>
        </article>
      </section>

      <section className="dashboard-reading-panel">
        <div className="dashboard-panel-head">
          <div>
            <span className="eyebrow">Panorama de leitura</span>
            <h2>Status da coleção</h2>
          </div>
        </div>

        <div className="dashboard-status-grid">
          <article className="dashboard-status-card">
            <strong>{metrics.wantToReadCount}</strong>
            <span>Quero ler</span>
          </article>
          <article className="dashboard-status-card">
            <strong>{metrics.readingNowCount}</strong>
            <span>Lendo</span>
          </article>
          <article className="dashboard-status-card">
            <strong>{metrics.finishedCount}</strong>
            <span>Lidos</span>
          </article>
          <article className="dashboard-status-card dashboard-status-card-highlight">
            <strong>{metrics.favoriteCount}</strong>
            <span>Favoritos</span>
          </article>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-head">
          <div>
            <span className="eyebrow">Registros recentes</span>
            <h2>Últimos livros cadastrados</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onOpenCollection}>
            Ver coleção
          </button>
        </div>

        {recentBooks.length > 0 ? (
          <div className="dashboard-recent-list">
            {recentBooks.map((book) => (
              <article key={book.id} className="dashboard-recent-card">
                <div className="dashboard-recent-copy">
                  <h3>{book.titulo}</h3>
                  <p>{book.autor}</p>
                </div>
                <span>{formatDate(book.created_at)}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state dashboard-empty-state">
            <p>Nenhum livro cadastrado ainda. Sua coleção vai aparecer aqui assim que o primeiro registro entrar.</p>
          </div>
        )}
      </section>
    </section>
  )
}
