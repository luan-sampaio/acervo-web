import { useEffect, useRef, useState } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BookListPanel from '../components/BookListPanel'
import CreateBookModal from '../components/CreateBookModal'
import DeleteBookModal from '../components/DeleteBookModal'
import {
  defaultQuery,
  readingStatusOptions,
  sortOptions,
} from '../constants'
import { deleteBook, fetchBooks, updateBook } from '../services/api'
import { getTextFieldError } from '../utils'

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

function getFieldErrorsFromApi(error) {
  const fieldErrors = { titulo: '', autor: '' }

  if (!Array.isArray(error?.errors)) {
    return fieldErrors
  }

  error.errors.forEach((item) => {
    if (item.field === 'body.titulo') {
      fieldErrors.titulo = item.message
    }

    if (item.field === 'body.autor') {
      fieldErrors.autor = item.message
    }
  })

  return fieldErrors
}

export default function CollectionPage() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState(defaultQuery)
  const [searchTerm, setSearchTerm] = useState(defaultQuery.search)
  const [editingBookId, setEditingBookId] = useState(null)
  const [activeMenuBookId, setActiveMenuBookId] = useState(null)
  const [bookPendingDelete, setBookPendingDelete] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const actionMenuRef = useRef(null)

  const booksQuery = useQuery({
    queryKey: ['books', query],
    queryFn: () => fetchBooks(mapBooksQueryParams(query)),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  })

  const updateBookMutation = useMutation({
    mutationFn: ({ bookId, payload }) => updateBook(bookId, payload),
    onSuccess: async () => {
      setEditingBookId(null)
      setSuccessMessage('✓ Livro atualizado com sucesso')
      await queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })

  const deleteBookMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: async (_, bookId) => {
      const totalBooks = booksQuery.data?.total ?? 0
      const nextTotal = Math.max(totalBooks - 1, 0)
      const nextOffset = nextTotal === 0
        ? 0
        : Math.min(query.offset, Math.floor((nextTotal - 1) / query.limit) * query.limit)

      if (editingBookId === bookId) {
        setEditingBookId(null)
      }

      setBookPendingDelete(null)
      setQuery((current) => ({
        ...current,
        offset: nextOffset,
      }))
      setSuccessMessage('✓ Livro removido com sucesso')
      await queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })

  useEffect(() => {
    if (!successMessage) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage('')
    }, 3200)

    return () => window.clearTimeout(timeoutId)
  }, [successMessage])

  useEffect(() => {
    if (activeMenuBookId === null) {
      return undefined
    }

    function handlePointerDown(event) {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setActiveMenuBookId(null)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setActiveMenuBookId(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeMenuBookId])

  useEffect(() => {
    const normalizedSearch = searchTerm.trim()

    if (normalizedSearch === query.search) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      setActiveMenuBookId(null)
      setEditingBookId(null)
      setQuery((current) => ({
        ...current,
        search: normalizedSearch,
        author: '',
        offset: 0,
      }))
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [query.search, searchTerm])

  const books = booksQuery.data?.items ?? []
  const totalBooks = booksQuery.data?.total ?? 0
  const editServerErrors = getFieldErrorsFromApi(updateBookMutation.error)
  const editErrors = editingBookId === null ? { titulo: '', autor: '' } : editServerErrors
  const totalPages = Math.max(1, Math.ceil(totalBooks / query.limit))
  const currentPage = Math.min(totalPages, Math.floor(query.offset / query.limit) + 1)
  const hasPreviousPage = query.offset > 0
  const hasNextPage = query.offset + query.limit < totalBooks
  const visibleRangeStart = totalBooks === 0 ? 0 : query.offset + 1
  const visibleRangeEnd = query.offset + books.length
  const listError = booksQuery.error?.message ?? updateBookMutation.error?.message ?? deleteBookMutation.error?.message ?? ''

  function handleSearchChange(event) {
    setSearchTerm(event.target.value)
  }

  function toggleActionMenu(bookId) {
    setActiveMenuBookId((current) => (current === bookId ? null : bookId))
  }

  function cancelEditing() {
    updateBookMutation.reset()
    setEditingBookId(null)
  }

  function handleQueryUpdate(nextQuery) {
    setActiveMenuBookId(null)
    cancelEditing()
    setQuery(nextQuery)
  }

  function handleClearFilters() {
    setSearchTerm('')
    handleQueryUpdate({
      ...query,
      search: '',
      statusFilter: 'all',
      offset: 0,
    })
  }

  function openCreateModal() {
    setActiveMenuBookId(null)
    cancelEditing()
    setIsCreateModalOpen(true)
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false)
  }

  function handleSortByChange(event) {
    handleQueryUpdate({
      ...query,
      sortBy: event.target.value,
      offset: 0,
    })
  }

  function handleToggleSortOrder() {
    handleQueryUpdate({
      ...query,
      sortOrder: query.sortOrder === 'asc' ? 'desc' : 'asc',
      offset: 0,
    })
  }

  function handleStatusFilterChange(nextFilter) {
    handleQueryUpdate({
      ...query,
      statusFilter: query.statusFilter === nextFilter ? 'all' : nextFilter,
      offset: 0,
    })
  }

  function handlePreviousPage() {
    if (!hasPreviousPage) {
      return
    }

    handleQueryUpdate({
      ...query,
      offset: Math.max(0, query.offset - query.limit),
    })
  }

  function handleNextPage() {
    if (!hasNextPage) {
      return
    }

    handleQueryUpdate({
      ...query,
      offset: query.offset + query.limit,
    })
  }

  function startEditing(book) {
    updateBookMutation.reset()
    setActiveMenuBookId(null)
    setEditingBookId(book.id)
  }

  async function handleUpdateBook(bookId, event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const payload = {
      titulo: String(formData.get('titulo') ?? '').trim(),
      autor: String(formData.get('autor') ?? '').trim(),
      status_leitura: String(formData.get('status_leitura') ?? 'quero_ler'),
      favorito: formData.get('favorito') === 'on',
    }

    if (getTextFieldError('Título', payload.titulo) || getTextFieldError('Autor', payload.autor)) {
      return
    }

    await updateBookMutation.mutateAsync({ bookId, payload })
  }

  function requestDeleteBook(book) {
    setActiveMenuBookId(null)
    setBookPendingDelete(book)
  }

  function closeDeleteModal() {
    if (deleteBookMutation.isPending) {
      return
    }

    setBookPendingDelete(null)
  }

  async function handleDeleteBook() {
    if (!bookPendingDelete) {
      return
    }

    await deleteBookMutation.mutateAsync(bookPendingDelete.id)
  }

  if (booksQuery.isLoading && !booksQuery.isPlaceholderData) {
    return (
      <section className="skeleton-page">
        <div className="panel skeleton-panel">
          <div className="skeleton-line skeleton-line-sm" />
          <div className="skeleton-line skeleton-line-lg" />
          <div className="skeleton-line skeleton-line-md" />
        </div>

        <div className="panel skeleton-panel">
          <div className="skeleton-line skeleton-line-full" />
          <div className="skeleton-row">
            <div className="skeleton-line skeleton-line-half" />
            <div className="skeleton-line skeleton-line-half" />
          </div>
          <div className="skeleton-line skeleton-card" />
          <div className="skeleton-line skeleton-card" />
          <div className="skeleton-line skeleton-card" />
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="content-grid">
        <BookListPanel
          books={books}
          totalBooks={totalBooks}
          query={query}
          searchTerm={searchTerm}
          isLoading={booksQuery.isFetching && !booksQuery.isPending && !booksQuery.isPlaceholderData}
          editingBookId={editingBookId}
          activeMenuBookId={activeMenuBookId}
          editErrors={editErrors}
          savingBookId={updateBookMutation.isPending ? updateBookMutation.variables?.bookId ?? null : null}
          readingStatusOptions={readingStatusOptions}
          currentPage={currentPage}
          totalPages={totalPages}
          visibleRangeStart={visibleRangeStart}
          visibleRangeEnd={visibleRangeEnd}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          actionMenuRef={actionMenuRef}
          onSearchChange={handleSearchChange}
          onClearFilters={handleClearFilters}
          sortOptions={sortOptions}
          onSortByChange={handleSortByChange}
          onToggleSortOrder={handleToggleSortOrder}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onToggleMenu={toggleActionMenu}
          onStartEditing={startEditing}
          onRequestDelete={requestDeleteBook}
          onSave={handleUpdateBook}
          onCancelEditing={cancelEditing}
          onOpenCreateModal={openCreateModal}
          onStatusFilterChange={handleStatusFilterChange}
          error={listError}
        />
      </section>

      {successMessage ? <div className="toast toast-success">{successMessage}</div> : null}

      {isCreateModalOpen ? (
        <CreateBookModal
          onClose={closeCreateModal}
          onCreated={(message) => {
            setIsCreateModalOpen(false)
            setSuccessMessage(message)
            setQuery((current) => ({
              ...current,
              offset: 0,
            }))
          }}
        />
      ) : null}

      <DeleteBookModal
        book={bookPendingDelete}
        isDeleting={deleteBookMutation.isPending}
        onCancel={closeDeleteModal}
        onConfirm={handleDeleteBook}
      />
    </>
  )
}
