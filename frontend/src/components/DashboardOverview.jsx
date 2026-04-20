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

function DashboardProgressCard({
  label,
  value,
  rate,
}) {
  const normalizedRate = Math.max(0, Math.min(rate, 100))

  return (
    <article className="dashboard-progress-card">
      <div className="dashboard-progress-card-head">
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <div className="dashboard-progress-track" aria-hidden="true">
        <span style={{ width: `${normalizedRate}%` }} />
      </div>
      <p>{formatRate(rate)}</p>
    </article>
  )
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

function getAchievements(metrics) {
  return [
    {
      title: 'Primeira leitura',
      description: 'Conclua 1 livro.',
      current: metrics.finishedCount,
      target: 1,
    },
    {
      title: 'Leitor consistente',
      description: 'Conclua 10 livros.',
      current: metrics.finishedCount,
      target: 10,
    },
    {
      title: 'Crítico do acervo',
      description: 'Avalie 5 livros.',
      current: metrics.ratedCount,
      target: 5,
    },
    {
      title: 'Curador',
      description: 'Marque 5 favoritos.',
      current: metrics.favoriteCount,
      target: 5,
    },
  ].map((achievement) => ({
    ...achievement,
    progress: Math.min((achievement.current / achievement.target) * 100, 100),
    unlocked: achievement.current >= achievement.target,
  }))
}

export default function DashboardOverview({
  metrics,
  recentBooks,
  onOpenCollection,
}) {
  const achievements = getAchievements(metrics)
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked).length

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

      <section className="dashboard-progress-grid" aria-label="Progresso de leitura">
        <article className="dashboard-progress-card dashboard-progress-card-total">
          <div className="dashboard-progress-card-head">
            <span>Total no acervo</span>
            <strong>{metrics.totalBooks}</strong>
          </div>
          <p>{metrics.favoriteCount === 1 ? '1 favorito' : `${metrics.favoriteCount} favoritos`}</p>
        </article>
        <DashboardProgressCard
          label="Concluídos"
          value={metrics.finishedCount}
          rate={metrics.completionRate}
        />
        <DashboardProgressCard
          label="Com anotação"
          value={metrics.annotationCount}
          rate={metrics.annotationRate}
        />
        <DashboardProgressCard
          label="Com resenha"
          value={metrics.reviewCount}
          rate={metrics.reviewRate}
        />
      </section>

      <section className="dashboard-reading-panel">
        <div className="dashboard-panel-head">
          <div>
            <h2>Status da coleção</h2>
          </div>
        </div>

        <div className="dashboard-status-grid">
          <article className="dashboard-status-card dashboard-status-card-want">
            <div className="dashboard-status-card-body">
              <strong>{metrics.wantToReadCount}</strong>
              <span>Quero ler</span>
              <p>Fila de próximas leituras.</p>
            </div>
          </article>
          <article className="dashboard-status-card dashboard-status-card-reading">
            <div className="dashboard-status-card-body">
              <strong>{metrics.readingNowCount}</strong>
              <span>Lendo</span>
              <p>Em andamento agora.</p>
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

      <section className="dashboard-panel dashboard-achievements-panel">
        <div className="dashboard-panel-head">
          <div>
            <h2>Conquistas</h2>
          </div>
          <span className="dashboard-panel-pill">
            {unlockedAchievements}/{achievements.length}
          </span>
        </div>

        <div className="dashboard-achievements-grid">
          {achievements.map((achievement) => (
            <article
              key={achievement.title}
              className={`dashboard-achievement-card ${achievement.unlocked ? 'dashboard-achievement-card-unlocked' : ''}`}
            >
              <div className="dashboard-achievement-mark" aria-hidden="true">
                {achievement.unlocked ? '✓' : achievement.current}
              </div>
              <div className="dashboard-achievement-copy">
                <strong>{achievement.title}</strong>
                <span>{achievement.description}</span>
                <div className="dashboard-achievement-track" aria-hidden="true">
                  <span style={{ width: `${achievement.progress}%` }} />
                </div>
              </div>
            </article>
          ))}
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
