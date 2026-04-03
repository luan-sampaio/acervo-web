import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BookFormPanel from '../components/BookFormPanel'
import BookListPanel from '../components/BookListPanel'
import DeleteBookModal from '../components/DeleteBookModal'
import {
  defaultQuery,
  initialForm,
  readingStatusOptions,
  sortOptions,
} from '../constants'
import { createBook, deleteBook, fetchBooks, updateBook } from '../services/api'
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
  const [form, setForm] = useState(initialForm)
  const [query, setQuery] = useState(defaultQuery)
  const [searchTerm, setSearchTerm] = useState(defaultQuery.search)
  const [formTouched, setFormTouched] = useState({ titulo: false, autor: false })
  const [editingBookId, setEditingBookId] = useState(null)
  const [activeMenuBookId, setActiveMenuBookId] = useState(null)
  const [bookPendingDelete, setBookPendingDelete] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const actionMenuRef = useRef(null)

  const booksQuery = useQuery({
    queryKey: ['books', query],
    queryFn: () => fetchBooks(mapBooksQueryParams(query)),
  })

  const createBookMutation = useMutation({
    mutationFn: createBook,
    onSuccess: async () => {
      setForm(initialForm)
      setFormTouched({ titulo: false, autor: false })
      setIsCreateModalOpen(false)
      setSuccessMessage('✓ Livro cadastrado com sucesso')
      setQuery((current) => ({
        ...current,
        offset: 0,
      }))
      await queryClient.invalidateQueries({ queryKey: ['books'] })
    },
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
    if (!isCreateModalOpen) {
      return undefined
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape' && !createBookMutation.isPending) {
        setIsCreateModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [createBookMutation.isPending, isCreateModalOpen])

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
  const formServerErrors = getFieldErrorsFromApi(createBookMutation.error)
  const editServerErrors = getFieldErrorsFromApi(updateBookMutation.error)
  const formErrors = useMemo(() => ({
    titulo: getTextFieldError('Título', form.titulo) || formServerErrors.titulo,
    autor: getTextFieldError('Autor', form.autor) || formServerErrors.autor,
  }), [form.autor, form.titulo, formServerErrors.autor, formServerErrors.titulo])
  const editErrors = editingBookId === null ? { titulo: '', autor: '' } : editServerErrors
  const isFormValid = !formErrors.titulo && !formErrors.autor
  const totalPages = Math.max(1, Math.ceil(totalBooks / query.limit))
  const currentPage = Math.min(totalPages, Math.floor(query.offset / query.limit) + 1)
  const hasPreviousPage = query.offset > 0
  const hasNextPage = query.offset + query.limit < totalBooks
  const visibleRangeStart = totalBooks === 0 ? 0 : query.offset + 1
  const visibleRangeEnd = query.offset + books.length
  const listError = booksQuery.error?.message ?? updateBookMutation.error?.message ?? deleteBookMutation.error?.message ?? ''

  function handleChange(event) {
    const { name, type, checked, value } = event.target
    createBookMutation.reset()
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleSearchChange(event) {
    setSearchTerm(event.target.value)
  }

  function handleFieldBlur(event) {
    const { name } = event.target
    setFormTouched((current) => ({
      ...current,
      [name]: true,
    }))
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
    createBookMutation.reset()
    setIsCreateModalOpen(true)
  }

  function closeCreateModal() {
    if (createBookMutation.isPending) {
      return
    }

    createBookMutation.reset()
    setIsCreateModalOpen(false)
    setForm(initialForm)
    setFormTouched({ titulo: false, autor: false })
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

  async function handleSubmit(event) {
    event.preventDefault()

    if (!isFormValid) {
      setFormTouched({ titulo: true, autor: true })
      return
    }

    await createBookMutation.mutateAsync({
      titulo: form.titulo.trim(),
      autor: form.autor.trim(),
      status_leitura: form.status_leitura,
      favorito: form.favorito,
    })
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

  return (
    <>
      <section className="content-grid">
        <BookListPanel
          books={books}
          totalBooks={totalBooks}
          filteredBooks={books}
          query={query}
          searchTerm={searchTerm}
          isLoading={booksQuery.isLoading}
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
          error={!isCreateModalOpen ? listError : ''}
        />
      </section>

      {successMessage ? <div className="toast toast-success">{successMessage}</div> : null}

      {isCreateModalOpen ? (
        <div className="modal-overlay" role="presentation" onClick={(event) => {
          if (event.target === event.currentTarget) {
            closeCreateModal()
          }
        }}>
          <BookFormPanel
            form={form}
            formErrors={formErrors}
            formTouched={formTouched}
            isFormValid={isFormValid}
            isSubmitting={createBookMutation.isPending}
            error={createBookMutation.error?.message ?? ''}
            readingStatusOptions={readingStatusOptions}
            onChange={handleChange}
            onBlur={handleFieldBlur}
            onSubmit={handleSubmit}
            variant="modal"
            onCancel={closeCreateModal}
          />
        </div>
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
