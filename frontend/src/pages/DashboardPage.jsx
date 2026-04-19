import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import DashboardOverview from '../components/DashboardOverview'
import { fetchBooks } from '../services/api'

export default function DashboardPage() {
  const navigate = useNavigate()
  const booksQuery = useQuery({
    queryKey: ['dashboard-books'],
    queryFn: () => fetchBooks({
      limit: 100,
      offset: 0,
      sort_by: 'created_at',
      sort_order: 'desc',
    }),
  })

  const books = booksQuery.data?.items ?? []

  const metrics = useMemo(() => {
    const favoriteCount = books.filter((book) => book.favorito).length
    const readingNowCount = books.filter((book) => book.status_leitura === 'lendo').length
    const finishedCount = books.filter((book) => book.status_leitura === 'lido').length
    const wantToReadCount = books.filter((book) => book.status_leitura === 'quero_ler').length
    const annotatedBooks = books.filter((book) => book.annotation)
    const ratedBooks = annotatedBooks.filter((book) => book.annotation.rating)
    const datedReadings = annotatedBooks.filter((book) => (
      book.annotation.started_at || book.annotation.finished_at
    ))
    const reviewCount = annotatedBooks.filter((book) => book.annotation.review).length
    const averageRating = ratedBooks.length
      ? ratedBooks.reduce((total, book) => total + book.annotation.rating, 0) / ratedBooks.length
      : null

    return {
      favoriteCount,
      readingNowCount,
      finishedCount,
      wantToReadCount,
      annotationCount: annotatedBooks.length,
      averageRating,
      datedReadingCount: datedReadings.length,
      reviewCount,
    }
  }, [books])

  const recentBooks = useMemo(() => {
    return [...books]
      .sort((firstBook, secondBook) => {
        return new Date(secondBook.created_at).getTime() - new Date(firstBook.created_at).getTime()
      })
      .slice(0, 4)
  }, [books])

  if (booksQuery.isLoading) {
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

  if (booksQuery.isError) {
    return (
      <section className="dashboard-panel">
        <div className="feedback error">
          {booksQuery.error.message}
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
