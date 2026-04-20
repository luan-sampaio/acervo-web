import { formatDate, formatRatingLabel, formatReadingPeriod } from '../utils'

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

function formatAverageRating(value) {
  if (!value) {
    return '-'
  }

  return value.toFixed(1).replace('.', ',')
}

function formatRate(value) {
  return `${value.toFixed(value % 1 === 0 ? 0 : 1).replace('.', ',')}%`
}

function DashboardReadingMeta({ annotation }) {
  if (!annotation) {
    return null
  }

  const ratingLabel = formatRatingLabel(annotation.rating)
  const readingPeriod = formatReadingPeriod(annotation)
  const hasReview = Boolean(annotation.review)

  if (!ratingLabel && !readingPeriod && !hasReview) {
    return null
  }

  return (
    <div className="dashboard-reading-meta">
      {ratingLabel ? <span>{ratingLabel}</span> : null}
      {readingPeriod ? <span>{readingPeriod}</span> : null}
      {hasReview ? <span>Resenha</span> : null}
    </div>
  )
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
          <h1>Dashboard</h1>
          <p>Resumo rápido da sua biblioteca.</p>
        </div>

        <div className="dashboard-actions">
          <button type="button" className="home-primary-action" onClick={onOpenCollection}>
            Abrir coleção
          </button>
        </div>
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
              <p>{formatRate(metrics.completionRate)} do acervo concluido.</p>
            </div>
          </article>
        </div>

        <div className="dashboard-reading-summary-grid">
          <article className="dashboard-reading-summary-card">
            <strong>{metrics.annotationCount}</strong>
            <span>Anotados</span>
            <p>{formatRate(metrics.annotationRate)} dos lidos têm registro.</p>
          </article>
          <article className="dashboard-reading-summary-card">
            <strong>{formatAverageRating(metrics.averageRating)}</strong>
            <span>Média de nota</span>
            <p>{metrics.ratedCount} avaliados, {metrics.unratedFinishedCount} lidos sem nota.</p>
          </article>
          <article className="dashboard-reading-summary-card">
            <strong>{metrics.datedReadingCount}</strong>
            <span>Com histórico</span>
            <p>Leituras com início ou término registrado.</p>
          </article>
          <article className="dashboard-reading-summary-card">
            <strong>{metrics.reviewCount}</strong>
            <span>Resenhados</span>
            <p>{formatRate(metrics.reviewRate)} dos lidos já têm comentário.</p>
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
                  <DashboardReadingMeta annotation={book.annotation} />
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
