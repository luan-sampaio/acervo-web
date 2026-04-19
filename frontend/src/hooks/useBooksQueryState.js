import { useEffect, useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { defaultQuery } from '../constants'
import { fetchBooks } from '../services/api'

function mapBooksQueryParams(query) {
  return {
    limit: query.limit,
    offset: query.offset,
    sort_by: query.sortBy,
    sort_order: query.sortOrder,
    search: query.search,
    status_leitura: ['quero_ler', 'lendo', 'lido'].includes(query.statusFilter) ? query.statusFilter : undefined,
    favorito_only: query.statusFilter === 'favorito' ? true : undefined,
  }
}

export function useBooksQueryState({
  onBeforeQueryChange,
  onBeforeSearchChange,
} = {}) {
  const [query, setQuery] = useState(defaultQuery)
  const [searchTerm, setSearchTerm] = useState(defaultQuery.search)

  const booksQuery = useQuery({
    queryKey: ['books', query],
    queryFn: () => fetchBooks(mapBooksQueryParams(query)),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })

  const books = booksQuery.data?.items ?? []
  const totalBooks = booksQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalBooks / query.limit))
  const currentPage = Math.min(totalPages, Math.floor(query.offset / query.limit) + 1)
  const hasPreviousPage = query.offset > 0
  const hasNextPage = query.offset + query.limit < totalBooks
  const visibleRangeStart = totalBooks === 0 ? 0 : query.offset + 1
  const visibleRangeEnd = query.offset + books.length

  function updateQuery(nextQuery) {
    onBeforeQueryChange?.()
    setQuery(nextQuery)
  }

  useEffect(() => {
    const normalizedSearch = searchTerm.trim()

    if (normalizedSearch === query.search) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      onBeforeSearchChange?.()
      setQuery((current) => ({
        ...current,
        search: normalizedSearch,
        offset: 0,
      }))
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [onBeforeSearchChange, query.search, searchTerm])

  function handleSearchChange(event) {
    setSearchTerm(event.target.value)
  }

  function handleClearFilters() {
    setSearchTerm('')
    updateQuery({
      ...query,
      search: '',
      statusFilter: 'all',
      offset: 0,
    })
  }

  function handleSortByChange(event) {
    updateQuery({
      ...query,
      sortBy: event.target.value,
      offset: 0,
    })
  }

  function handleToggleSortOrder() {
    updateQuery({
      ...query,
      sortOrder: query.sortOrder === 'asc' ? 'desc' : 'asc',
      offset: 0,
    })
  }

  function handleStatusFilterChange(nextFilter) {
    updateQuery({
      ...query,
      statusFilter: query.statusFilter === nextFilter ? 'all' : nextFilter,
      offset: 0,
    })
  }

  function handlePreviousPage() {
    if (!hasPreviousPage) {
      return
    }

    updateQuery({
      ...query,
      offset: Math.max(0, query.offset - query.limit),
    })
  }

  function handleNextPage() {
    if (!hasNextPage) {
      return
    }

    updateQuery({
      ...query,
      offset: query.offset + query.limit,
    })
  }

  return {
    books,
    booksQuery,
    currentPage,
    hasNextPage,
    hasPreviousPage,
    handleClearFilters,
    handleNextPage,
    handlePreviousPage,
    handleSearchChange,
    handleSortByChange,
    handleStatusFilterChange,
    handleToggleSortOrder,
    query,
    searchTerm,
    setQuery,
    totalBooks,
    totalPages,
    visibleRangeEnd,
    visibleRangeStart,
  }
}
