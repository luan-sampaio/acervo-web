import { formatRatingLabel, formatReadingPeriod } from '../utils'

function getReadingStatusLabel(value) {
  if (value === 'quero_ler') return 'Quero ler'
  if (value === 'lendo') return 'Lendo'
  if (value === 'lido') return 'Lido'
  return value
}

function getReadingStatusClassName(value) {
  if (value === 'quero_ler') return 'dashboard-status-tone-want'
  if (value === 'lendo') return 'dashboard-status-tone-reading'
  if (value === 'lido') return 'dashboard-status-tone-finished'
  return ''
}

function KpiCard({
  label,
  value,
  hint,
  tone = '',
}) {
  return (
    <article className={`dashboard-kpi-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{hint}</p>
    </article>
  )
}

function DashboardReadingMeta({ annotation }) {
  if (!annotation) return null

  const ratingLabel = formatRatingLabel(annotation.rating)
  const readingPeriod = formatReadingPeriod(annotation)
  const hasReview = Boolean(annotation.review)

  if (!ratingLabel && !readingPeriod && !hasReview) return null

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
    unlocked: achievement.current >= achievement.target,
  }))
}

function QueueBookCard({ book }) {
  return (
    <article className="dashboard-queue-card">
      <span className={`dashboard-recent-status ${getReadingStatusClassName(book.status_leitura)}`}>
        {getReadingStatusLabel(book.status_leitura)}
      </span>
      <h3>{book.titulo}</h3>
      <p>{book.autor}</p>
    </article>
  )
}

export default function DashboardOverview({
  metrics,
  readingNowBook,
  wantToReadBooks,
  onOpenCollection,
}) {
  const achievements = getAchievements(metrics)
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked).length
  const hasBooks = metrics.totalBooks > 0

  return (
    <section className="dashboard-grid">
      <section className="dashboard-kpi-grid" aria-label="Resumo da coleção">
        <KpiCard label="Total no acervo" value={metrics.totalBooks} hint={`${metrics.favoriteCount} favoritos`} />
        <KpiCard label="Lidos" value={metrics.finishedCount} hint="Concluídos" tone="dashboard-kpi-finished" />
        <KpiCard label="Lendo" value={metrics.readingNowCount} hint="Em andamento" tone="dashboard-kpi-reading" />
        <KpiCard label="Quero ler" value={metrics.wantToReadCount} hint="Fila de próximas leituras" tone="dashboard-kpi-want" />
      </section>

      {!hasBooks ? (
        <section className="dashboard-start-card">
          <strong>Sua biblioteca ainda está vazia</strong>
          <p>Cadastre o primeiro livro para liberar métricas, conquistas e histórico recente.</p>
          <button type="button" className="action-button primary-button" onClick={onOpenCollection}>
            + Novo livro
          </button>
        </section>
      ) : null}

      <section className="dashboard-panel dashboard-current-reading-panel">
        <div className="dashboard-panel-head">
          <div>
            <h2>Lendo agora</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onOpenCollection}>
            Atualizar progresso
          </button>
        </div>

        {readingNowBook ? (
          <article className="dashboard-current-book">
            {readingNowBook.cover_url ? (
              <img src={readingNowBook.cover_url} alt={`Capa de ${readingNowBook.titulo}`} loading="lazy" />
            ) : (
              <div className="dashboard-current-book-cover" aria-hidden="true">Livro</div>
            )}
            <div className="dashboard-current-book-copy">
              <span className={`dashboard-recent-status ${getReadingStatusClassName(readingNowBook.status_leitura)}`}>
                {getReadingStatusLabel(readingNowBook.status_leitura)}
              </span>
              <h3>{readingNowBook.titulo}</h3>
              <p>{readingNowBook.autor}</p>
              <DashboardReadingMeta annotation={readingNowBook.annotation} />
            </div>
          </article>
        ) : (
          <div className="dashboard-current-empty">
            <strong>Nenhuma leitura em andamento</strong>
            <p>Escolha um livro da fila e marque como Lendo para acompanhar por aqui.</p>
            <button type="button" className="action-button primary-button" onClick={onOpenCollection}>
              Escolher da fila
            </button>
          </div>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-head">
          <div>
            <h2>Fila de próximas leituras</h2>
          </div>
          <button type="button" className="secondary-button" onClick={onOpenCollection}>
            Ver coleção
          </button>
        </div>

        {wantToReadBooks.length > 0 ? (
          <div className="dashboard-queue-list">
            {wantToReadBooks.map((book) => (
              <QueueBookCard key={book.id} book={book} />
            ))}
          </div>
        ) : (
          <div className="empty-state dashboard-empty-state">
            <p>Nenhum livro na fila. Marque livros como Quero ler para formar sua próxima seleção.</p>
          </div>
        )}
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
                <small>{achievement.current}/{achievement.target}</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}
