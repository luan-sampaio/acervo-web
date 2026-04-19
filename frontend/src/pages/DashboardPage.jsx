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

  const recentBooksQuery = useQuery({
    queryKey: ['dashboard-recent-books'],
    queryFn: () => fetchBooks({
      limit: 4,
      offset: 0,
      sort_by: 'created_at',
      sort_order: 'desc',
    }),
  })

  const stats = statsQuery.data
  const recentBooks = recentBooksQuery.data?.items ?? []
  const metrics = {
    favoriteCount: stats?.favorite_count ?? 0,
    readingNowCount: stats?.reading_now_count ?? 0,
    finishedCount: stats?.finished_count ?? 0,
    wantToReadCount: stats?.want_to_read_count ?? 0,
    annotationCount: stats?.annotation_count ?? 0,
    averageRating: stats?.average_rating ?? null,
    datedReadingCount: stats?.dated_reading_count ?? 0,
    reviewCount: stats?.review_count ?? 0,
  }

  if (statsQuery.isLoading || recentBooksQuery.isLoading) {
    return (
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-8 w-72 rounded bg-slate-200" />
            <div className="h-4 w-full max-w-2xl rounded bg-slate-200" />
            <div className="h-11 w-40 rounded-full bg-slate-200" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-8 w-16 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-24 rounded bg-slate-200" />
            <div className="mt-2 h-4 w-full rounded bg-slate-200" />
          </div>
          <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-8 w-16 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-24 rounded bg-slate-200" />
            <div className="mt-2 h-4 w-full rounded bg-slate-200" />
          </div>
          <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-8 w-16 rounded bg-slate-200" />
            <div className="mt-3 h-4 w-24 rounded bg-slate-200" />
            <div className="mt-2 h-4 w-full rounded bg-slate-200" />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-36 rounded bg-slate-200" />
            <div className="h-7 w-64 rounded bg-slate-200" />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="h-24 rounded-2xl bg-slate-200" />
              <div className="h-24 rounded-2xl bg-slate-200" />
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (statsQuery.isError || recentBooksQuery.isError) {
    return (
      <section className="dashboard-panel">
        <div className="feedback error">
          {statsQuery.error?.message ?? recentBooksQuery.error?.message}
        </div>
      </section>
    )
  }

  return (
    <DashboardOverview
      metrics={metrics}
      recentBooks={recentBooks}
      onOpenCollection={() => navigate('/collection')}
    />
  )
}
