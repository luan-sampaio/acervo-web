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

    return {
      favoriteCount,
      readingNowCount,
      finishedCount,
      wantToReadCount,
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
      <section className="dashboard-panel">
        <p>Carregando painel...</p>
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
