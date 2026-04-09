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

function getReadingStatusClassName(value) {
  if (value === 'quero_ler') {
    return 'dashboard-status-tone-want'
  }

  if (value === 'lendo') {
    return 'dashboard-status-tone-reading'
  }

  if (value === 'lido') {
    return 'dashboard-status-tone-finished'
  }

  return ''
}

export default function DashboardOverview({
  metrics,
  recentBooks,
  onOpenCollection,
}) {
  return (
    <section className="dashboard-grid">
      <section className="dashboard-hero">
        <div className="dashboard-hero-copy">
          <h1>Seu painel de leitura, em um só lugar.</h1>
          <p>
            Acompanhe o crescimento da sua biblioteca, veja o que merece atenção agora e
            avance para a coleção sempre que quiser cadastrar ou revisar livros.
          </p>
          <div className="dashboard-actions">
            <button type="button" className="home-primary-action" onClick={onOpenCollection}>
              Ir para a coleção
            </button>
          </div>
        </div>

        <div className="dashboard-hero-side" aria-hidden="true" />
      </section>

      <section className="dashboard-reading-panel">
        <div className="dashboard-panel-head">
          <div>
            <h2>Status da coleção</h2>
          </div>
          <span className="dashboard-panel-pill">
            {metrics.favoriteCount === 1 ? '1 favorito' : `${metrics.favoriteCount} favoritos`}
          </span>
        </div>

        <div className="dashboard-status-grid">
          <article className="dashboard-status-card dashboard-status-card-want">
            <div className="dashboard-status-card-body">
              <strong>{metrics.wantToReadCount}</strong>
              <span>Quero ler</span>
              <p>Livros separados para a proxima leva de leitura.</p>
            </div>
          </article>
          <article className="dashboard-status-card dashboard-status-card-reading">
            <div className="dashboard-status-card-body">
              <strong>{metrics.readingNowCount}</strong>
              <span>Lendo</span>
              <p>Leituras em andamento pedindo continuidade.</p>
            </div>
          </article>
          <article className="dashboard-status-card dashboard-status-card-finished">
            <div className="dashboard-status-card-body">
              <strong>{metrics.finishedCount}</strong>
              <span>Lidos</span>
              <p>Titulos concluidos e ja absorvidos no acervo.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-head">
          <div>
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
                    <span className={`dashboard-recent-status ${getReadingStatusClassName(book.status_leitura)}`}>
                      {getReadingStatusLabel(book.status_leitura)}
                    </span>
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
