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
  const tracks = [
    { title: 'Leitor', description: 'Livros concluídos', action: 'Concluir uma leitura', current: metrics.finishedCount, targets: [1, 10, 25] },
    { title: 'Crítico', description: 'Livros avaliados', action: 'Adicionar uma nota', current: metrics.ratedCount, targets: [1, 5, 15] },
    { title: 'Curador', description: 'Favoritos marcados', action: 'Marcar um favorito', current: metrics.favoriteCount, targets: [1, 5, 12] },
    { title: 'Memorialista', description: 'Resenhas escritas', action: 'Escrever uma resenha', current: metrics.reviewCount, targets: [1, 5, 10] },
  ]

  return tracks.map((track) => {
    const unlockedLevel = track.targets.filter((target) => track.current >= target).length
    const nextTarget = track.targets.find((target) => track.current < target) ?? track.targets[track.targets.length - 1]
    const previousTarget = unlockedLevel > 0 ? track.targets[unlockedLevel - 1] : 0
    const progressRange = Math.max(nextTarget - previousTarget, 1)
    const progress = Math.min(Math.max(((track.current - previousTarget) / progressRange) * 100, 0), 100)

    return {
      ...track,
      unlockedLevel,
      nextTarget,
      remaining: Math.max(nextTarget - track.current, 0),
      progress,
      completed: unlockedLevel === track.targets.length,
    }
  })
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
  const unlockedAchievements = achievements.reduce((total, achievement) => total + achievement.unlockedLevel, 0)
  const totalAchievementLevels = achievements.reduce((total, achievement) => total + achievement.targets.length, 0)
  const nextAchievement = achievements
    .filter((achievement) => !achievement.completed)
    .sort((a, b) => a.remaining - b.remaining)[0]
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
            {unlockedAchievements}/{totalAchievementLevels}
          </span>
        </div>

        {nextAchievement ? (
          <article className="dashboard-next-achievement">
            <div>
              <span>Próximo objetivo</span>
              <strong>{nextAchievement.action}</strong>
              <p>
                Faltam {nextAchievement.remaining} para {nextAchievement.title} nível {nextAchievement.unlockedLevel + 1}.
              </p>
            </div>
            <button type="button" className="secondary-button" onClick={onOpenCollection}>
              Avançar
            </button>
          </article>
        ) : (
          <article className="dashboard-next-achievement dashboard-next-achievement-complete">
            <div>
              <span>Conquistas completas</span>
              <strong>Todas as trilhas foram concluídas</strong>
              <p>Seu acervo já desbloqueou todos os marcos atuais.</p>
            </div>
          </article>
        )}

        <div className="dashboard-achievements-grid">
          {achievements.map((achievement) => (
            <article
              key={achievement.title}
              className={`dashboard-achievement-card ${achievement.completed ? 'dashboard-achievement-card-unlocked' : ''}`}
            >
              <div className="dashboard-achievement-mark" aria-hidden="true">
                {achievement.completed ? '✓' : achievement.unlockedLevel}
              </div>
              <div className="dashboard-achievement-copy">
                <strong>{achievement.title}</strong>
                <span>{achievement.description}</span>
                <div className="dashboard-achievement-track" aria-hidden="true">
                  <span style={{ width: `${achievement.progress}%` }} />
                </div>
                <small>
                  {achievement.completed
                    ? 'Trilha completa'
                    : `${achievement.current}/${achievement.nextTarget} para o próximo nível`}
                </small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  )
}
