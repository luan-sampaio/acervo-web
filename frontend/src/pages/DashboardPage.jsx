import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import DashboardOverview from '../components/DashboardOverview'
import { fetchBooks, fetchBookStats } from '../services/api'

export default function DashboardPage() {
  const navigate = useNavigate()

  const statsQuery = useQuery({
    queryKey: ['book-stats'],
    queryFn: fetchBookStats,
  })

  const readingNowQuery = useQuery({
    queryKey: ['dashboard-reading-now'],
    queryFn: () => fetchBooks({
      limit: 1,
      offset: 0,
      status_leitura: 'lendo',
      sort_by: 'created_at',
      sort_order: 'desc',
    }),
  })

  const wantToReadQuery = useQuery({
    queryKey: ['dashboard-want-to-read'],
    queryFn: () => fetchBooks({
      limit: 4,
      offset: 0,
      status_leitura: 'quero_ler',
      sort_by: 'created_at',
      sort_order: 'desc',
    }),
  })

  const stats = statsQuery.data
  const readingNowBook = readingNowQuery.data?.items?.[0] ?? null
  const wantToReadBooks = wantToReadQuery.data?.items ?? []
  const metrics = {
    totalBooks: stats?.total_books ?? 0,
    favoriteCount: stats?.favorite_count ?? 0,
    readingNowCount: stats?.reading_now_count ?? 0,
    finishedCount: stats?.finished_count ?? 0,
    wantToReadCount: stats?.want_to_read_count ?? 0,
    annotationCount: stats?.annotation_count ?? 0,
    ratedCount: stats?.rated_count ?? 0,
    unratedFinishedCount: stats?.unrated_finished_count ?? 0,
    averageRating: stats?.average_rating ?? null,
    datedReadingCount: stats?.dated_reading_count ?? 0,
    reviewCount: stats?.review_count ?? 0,
    completionRate: stats?.completion_rate ?? 0,
    annotationRate: stats?.annotation_rate ?? 0,
    reviewRate: stats?.review_rate ?? 0,
  }

  if (statsQuery.isLoading || readingNowQuery.isLoading || wantToReadQuery.isLoading) {
    return (
      <section className="skeleton-page">
        <div className="panel skeleton-panel">
          <div className="skeleton-line skeleton-line-sm" />
          <div className="skeleton-line skeleton-line-lg" />
          <div className="skeleton-line skeleton-line-md" />
          <div className="skeleton-line skeleton-line-half" />
        </div>

        <div className="skeleton-row">
          <div className="panel skeleton-panel">
            <div className="skeleton-line skeleton-line-lg" />
            <div className="skeleton-line skeleton-line-sm" />
            <div className="skeleton-line skeleton-line-md" />
          </div>
          <div className="panel skeleton-panel">
            <div className="skeleton-line skeleton-line-lg" />
            <div className="skeleton-line skeleton-line-sm" />
            <div className="skeleton-line skeleton-line-md" />
          </div>
        </div>

        <div className="panel skeleton-panel">
          <div className="skeleton-line skeleton-line-sm" />
          <div className="skeleton-line skeleton-line-lg" />
          <div className="skeleton-row">
            <div className="skeleton-line skeleton-card" />
            <div className="skeleton-line skeleton-card" />
          </div>
        </div>
      </section>
    )
  }

  if (statsQuery.isError || readingNowQuery.isError || wantToReadQuery.isError) {
    return (
      <section className="dashboard-panel">
        <div className="feedback error">
          {statsQuery.error?.message ?? readingNowQuery.error?.message ?? wantToReadQuery.error?.message}
        </div>
      </section>
    )
  }

  return (
    <DashboardOverview
      metrics={metrics}
      readingNowBook={readingNowBook}
      wantToReadBooks={wantToReadBooks}
      onOpenCollection={() => navigate('/collection')}
    />
  )
}
