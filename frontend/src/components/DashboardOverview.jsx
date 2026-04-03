import { formatDate } from '../utils'

function getReadingStatusLabel(value) {
  if (value === 'quero_ler') {
    return 'Quero ler'
  }

  if (value === 'lendo') {
    return 'Lendo'
  }

  if (value === 'lido') {
    return 'Lido'
  }

  return value
}

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
          <h1>Seu painel de leitura, em um só lugar.</h1>
          <p>
            Acompanhe o crescimento da sua biblioteca, veja o que merece atenção agora e
            avance para a coleção sempre que quiser cadastrar ou revisar livros.
          </p>
        </div>

        <div className="dashboard-hero-side">
          <div className="dashboard-hero-highlight">
            <span className="dashboard-hero-highlight-label">Resumo do momento</span>
            <strong>{totalBooks === 1 ? '1 livro no acervo' : `${totalBooks} livros no acervo`}</strong>
            <p>{latestAdditionLabel}</p>
          </div>

          <div className="dashboard-actions">
            <button type="button" className="home-primary-action" onClick={onOpenCollection}>
              Ir para a coleção
            </button>
          </div>
        </div>
      </section>

      <section className="dashboard-stats">
        <article className="stat-card dashboard-stat-card dashboard-stat-card-primary">
          <span>Total de livros</span>
          <strong>{totalBooks}</strong>
          <p>{totalBooks === 1 ? '1 livro registrado' : `${totalBooks} livros registrados`}</p>
        </article>

        <article className="stat-card dashboard-stat-card dashboard-stat-card-wide">
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
          <article className="dashboard-status-card dashboard-status-card-want">
            <strong>{metrics.wantToReadCount}</strong>
            <span>Quero ler</span>
            <p>Livros separados para a proxima leva de leitura.</p>
          </article>
          <article className="dashboard-status-card dashboard-status-card-reading">
            <strong>{metrics.readingNowCount}</strong>
            <span>Lendo</span>
            <p>Leituras em andamento pedindo continuidade.</p>
          </article>
          <article className="dashboard-status-card dashboard-status-card-finished">
            <strong>{metrics.finishedCount}</strong>
            <span>Lidos</span>
            <p>Titulos concluidos e ja absorvidos no acervo.</p>
          </article>
          <article className="dashboard-status-card dashboard-status-card-highlight">
            <strong>{metrics.favoriteCount}</strong>
            <span>Favoritos</span>
            <p>Livros que seguem relevantes para revisitar sempre.</p>
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
                  <div className="dashboard-recent-badges">
                    <span className="dashboard-recent-status">{getReadingStatusLabel(book.status_leitura)}</span>
                    {book.favorito ? <span className="dashboard-recent-favorite">Favorito</span> : null}
                  </div>
                  <h3>{book.titulo}</h3>
                  <p>{book.autor}</p>
                </div>
                <span className="dashboard-recent-date">{formatDate(book.created_at)}</span>
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
