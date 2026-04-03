import { useEffect, useMemo, useRef, useState } from 'react'

import AppHeader from './components/AppHeader'
import BookFormPanel from './components/BookFormPanel'
import BookListPanel from './components/BookListPanel'
import DashboardOverview from './components/DashboardOverview'
import DeleteBookModal from './components/DeleteBookModal'
import HomeOverview from './components/HomeOverview'
import {
  defaultQuery,
  initialEditForm,
  initialForm,
  readingStatusOptions,
  sortOptions,
  sortOrderOptions,
} from './constants'
import { createBook, deleteBook, fetchBooks, updateBook } from './api'
import { formatLatestAddition, getTextFieldError } from './utils'

export default function App() {
  const [currentView, setCurrentView] = useState('home')
  const [form, setForm] = useState(initialForm)
  const [books, setBooks] = useState([])
  const [dashboardBooks, setDashboardBooks] = useState([])
  const [query, setQuery] = useState(defaultQuery)
  const [totalBooks, setTotalBooks] = useState(0)
  const [latestCreatedAt, setLatestCreatedAt] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formTouched, setFormTouched] = useState({ titulo: false, autor: false })
  const [editingBookId, setEditingBookId] = useState(null)
  const [activeMenuBookId, setActiveMenuBookId] = useState(null)
  const [editForm, setEditForm] = useState(initialEditForm)
  const [editTouched, setEditTouched] = useState({ titulo: false, autor: false })
  const [serverFormErrors, setServerFormErrors] = useState({ titulo: '', autor: '' })
  const [serverEditErrors, setServerEditErrors] = useState({ titulo: '', autor: '' })
  const [savingBookId, setSavingBookId] = useState(null)
  const [deletingBookId, setDeletingBookId] = useState(null)
  const [bookPendingDelete, setBookPendingDelete] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const actionMenuRef = useRef(null)

  async function loadBooks(params = query) {
    try {
      setIsLoading(true)
      setError('')
      const data = await fetchBooks({
        limit: params.limit,
        offset: params.offset,
        sort_by: params.sortBy,
        sort_order: params.sortOrder,
        search: params.search,
      })
      setBooks(data.items)
      setTotalBooks(data.total)
      setLatestCreatedAt(data.latest_created_at)
      setQuery({
        limit: data.limit,
        offset: data.offset,
        sortBy: data.sort_by,
        sortOrder: data.sort_order,
        search: data.search,
        author: '',
      })
      setSearchTerm(data.search)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function loadDashboardBooks() {
    try {
      const data = await fetchBooks({
        limit: 100,
        offset: 0,
        sort_by: 'created_at',
        sort_order: 'desc',
      })
      setDashboardBooks(data.items)
    } catch {
      setDashboardBooks([])
    }
  }

  useEffect(() => {
    loadBooks(defaultQuery)
  }, [])

  useEffect(() => {
    loadDashboardBooks()
  }, [])

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
      if (event.key === 'Escape' && !isSubmitting) {
        setIsCreateModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isCreateModalOpen, isSubmitting])

  useEffect(() => {
    const normalizedSearch = searchTerm.trim()
    if (
      normalizedSearch === query.search
    ) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      handleQueryUpdate({
        ...query,
        search: normalizedSearch,
        author: '',
        offset: 0,
      })
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [query, searchTerm])

  const latestAdditionLabel = useMemo(() => {
    return formatLatestAddition(latestCreatedAt)
  }, [latestCreatedAt])

  const recentBooks = useMemo(() => {
    return [...dashboardBooks]
      .sort((firstBook, secondBook) => {
        return new Date(secondBook.created_at).getTime() - new Date(firstBook.created_at).getTime()
      })
      .slice(0, 4)
  }, [dashboardBooks])

  const dashboardMetrics = useMemo(() => {
    const favoriteCount = dashboardBooks.filter((book) => book.favorito).length
    const readingNowCount = dashboardBooks.filter((book) => book.status_leitura === 'lendo').length
    const finishedCount = dashboardBooks.filter((book) => book.status_leitura === 'lido').length
    const wantToReadCount = dashboardBooks.filter((book) => book.status_leitura === 'quero_ler').length

    return {
      favoriteCount,
      readingNowCount,
      finishedCount,
      wantToReadCount,
    }
  }, [dashboardBooks])

  const formErrors = useMemo(() => ({
    titulo: getTextFieldError('Título', form.titulo) || serverFormErrors.titulo,
    autor: getTextFieldError('Autor', form.autor) || serverFormErrors.autor,
  }), [form.autor, form.titulo, serverFormErrors.autor, serverFormErrors.titulo])

  const editErrors = useMemo(() => ({
    titulo: getTextFieldError('Título', editForm.titulo) || serverEditErrors.titulo,
    autor: getTextFieldError('Autor', editForm.autor) || serverEditErrors.autor,
  }), [editForm.autor, editForm.titulo, serverEditErrors.autor, serverEditErrors.titulo])

  const isFormValid = !formErrors.titulo && !formErrors.autor
  const isEditFormValid = !editErrors.titulo && !editErrors.autor
  const totalPages = Math.max(1, Math.ceil(totalBooks / query.limit))
  const currentPage = Math.min(totalPages, Math.floor(query.offset / query.limit) + 1)
  const hasPreviousPage = query.offset > 0
  const hasNextPage = query.offset + query.limit < totalBooks
  const visibleRangeStart = totalBooks === 0 ? 0 : query.offset + 1
  const visibleRangeEnd = query.offset + books.length
  function handleChange(event) {
    const { name, type, checked, value } = event.target
    setServerFormErrors((current) => ({
      ...current,
      [name]: '',
    }))
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

  function handleEditChange(event) {
    const { name, type, checked, value } = event.target
    setServerEditErrors((current) => ({
      ...current,
      [name]: '',
    }))
    setEditForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleEditBlur(event) {
    const { name } = event.target
    setEditTouched((current) => ({
      ...current,
      [name]: true,
    }))
  }

  function toggleActionMenu(bookId) {
    setActiveMenuBookId((current) => (current === bookId ? null : bookId))
  }

  function cancelEditing() {
    setEditingBookId(null)
    setEditForm(initialEditForm)
    setEditTouched({ titulo: false, autor: false })
    setServerEditErrors({ titulo: '', autor: '' })
  }

  function getFieldErrorsFromApi(err) {
    const fieldErrors = { titulo: '', autor: '' }

    if (!Array.isArray(err?.errors)) {
      return fieldErrors
    }

    err.errors.forEach((item) => {
      if (item.field === 'body.titulo') {
        fieldErrors.titulo = item.message
      }

      if (item.field === 'body.autor') {
        fieldErrors.autor = item.message
      }
    })

    return fieldErrors
  }

  function handleQueryUpdate(nextQuery) {
    setActiveMenuBookId(null)
    cancelEditing()
    loadBooks(nextQuery)
  }

  function handleClearFilters() {
    setSearchTerm('')
  }

  function handleNavigate(view) {
    setCurrentView(view)
  }

  function openCreateModal() {
    setActiveMenuBookId(null)
    cancelEditing()
    setError('')
    setServerFormErrors({ titulo: '', autor: '' })
    setIsCreateModalOpen(true)
  }

  function closeCreateModal() {
    if (isSubmitting) {
      return
    }

    setIsCreateModalOpen(false)
    setError('')
    setForm(initialForm)
    setFormTouched({ titulo: false, autor: false })
    setServerFormErrors({ titulo: '', autor: '' })
  }

  function handleSortByChange(event) {
    handleQueryUpdate({
      ...query,
      sortBy: event.target.value,
      offset: 0,
    })
  }

  function handleSortOrderChange(event) {
    handleQueryUpdate({
      ...query,
      sortOrder: event.target.value,
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
    setError('')
    setServerEditErrors({ titulo: '', autor: '' })
    setActiveMenuBookId(null)
    setEditingBookId(book.id)
    setEditForm({
      titulo: book.titulo,
      autor: book.autor,
      status_leitura: book.status_leitura,
      favorito: book.favorito,
    })
    setEditTouched({ titulo: false, autor: false })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!isFormValid) {
      setFormTouched({ titulo: true, autor: true })
      return
    }

    const payload = {
      titulo: form.titulo.trim(),
      autor: form.autor.trim(),
      status_leitura: form.status_leitura,
      favorito: form.favorito,
    }

    try {
      setIsSubmitting(true)
      setError('')
      setServerFormErrors({ titulo: '', autor: '' })
      setSuccessMessage('')
      await createBook(payload)
      await loadBooks({
        ...query,
        offset: 0,
      })
      await loadDashboardBooks()
      setForm(initialForm)
      setFormTouched({ titulo: false, autor: false })
      setServerFormErrors({ titulo: '', autor: '' })
      setIsCreateModalOpen(false)
      setSuccessMessage('✓ Livro cadastrado com sucesso')
    } catch (err) {
      const nextFieldErrors = getFieldErrorsFromApi(err)
      const hasFieldErrors = Boolean(nextFieldErrors.titulo || nextFieldErrors.autor)
      setServerFormErrors(nextFieldErrors)
      setError(hasFieldErrors ? '' : err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateBook(bookId) {
    if (!isEditFormValid) {
      setEditTouched({ titulo: true, autor: true })
      return
    }

    const payload = {
      titulo: editForm.titulo.trim(),
      autor: editForm.autor.trim(),
      status_leitura: editForm.status_leitura,
      favorito: editForm.favorito,
    }

    try {
      setSavingBookId(bookId)
      setError('')
      setServerEditErrors({ titulo: '', autor: '' })
      setSuccessMessage('')
      await updateBook(bookId, payload)
      cancelEditing()
      await loadBooks(query)
      await loadDashboardBooks()
      setSuccessMessage('✓ Livro atualizado com sucesso')
    } catch (err) {
      const nextFieldErrors = getFieldErrorsFromApi(err)
      const hasFieldErrors = Boolean(nextFieldErrors.titulo || nextFieldErrors.autor)
      setServerEditErrors(nextFieldErrors)
      setError(hasFieldErrors ? '' : err.message)
    } finally {
      setSavingBookId(null)
    }
  }

  function requestDeleteBook(book) {
    setActiveMenuBookId(null)
    setBookPendingDelete(book)
  }

  function closeDeleteModal() {
    if (deletingBookId !== null) {
      return
    }

    setBookPendingDelete(null)
  }

  async function handleDeleteBook() {
    if (!bookPendingDelete) {
      return
    }

    const bookId = bookPendingDelete.id

    try {
      setDeletingBookId(bookId)
      setError('')
      setSuccessMessage('')
      await deleteBook(bookId)

      const nextTotal = Math.max(totalBooks - 1, 0)
      const nextOffset = nextTotal === 0
        ? 0
        : Math.min(query.offset, Math.floor((nextTotal - 1) / query.limit) * query.limit)

      if (editingBookId === bookId) {
        cancelEditing()
      }

      setBookPendingDelete(null)
      await loadBooks({
        ...query,
        offset: nextOffset,
      })
      await loadDashboardBooks()
      setSuccessMessage('✓ Livro removido com sucesso')
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingBookId(null)
    }
  }

  function renderCollectionContent() {
    return (
      <section className="content-grid">
        <BookListPanel
          books={books}
          totalBooks={totalBooks}
          filteredBooks={books}
          query={query}
          searchTerm={searchTerm}
          isLoading={isLoading}
          editingBookId={editingBookId}
          activeMenuBookId={activeMenuBookId}
          editForm={editForm}
          editErrors={editErrors}
          editTouched={editTouched}
          savingBookId={savingBookId}
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
          sortOrderOptions={sortOrderOptions}
          onSortByChange={handleSortByChange}
          onSortOrderChange={handleSortOrderChange}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onEditChange={handleEditChange}
          onEditBlur={handleEditBlur}
          onToggleMenu={toggleActionMenu}
          onStartEditing={startEditing}
          onRequestDelete={requestDeleteBook}
          onSave={handleUpdateBook}
          onCancelEditing={cancelEditing}
          onOpenCreateModal={openCreateModal}
          error={!isCreateModalOpen ? error : ''}
        />
      </section>
    )
  }

  return (
    <div className="app-shell">
      <AppHeader currentView={currentView} onNavigate={handleNavigate} />

      <main className="container">
        {currentView === 'home' ? (
          <HomeOverview
            onOpenCollection={() => setCurrentView('collection')}
          />
        ) : currentView === 'dashboard' ? (
          <DashboardOverview
            totalBooks={totalBooks}
            latestAdditionLabel={latestAdditionLabel}
            metrics={dashboardMetrics}
            recentBooks={recentBooks}
            onOpenCollection={() => setCurrentView('collection')}
          />
        ) : (
          renderCollectionContent()
        )}
      </main>

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
            isSubmitting={isSubmitting}
            error={error}
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
        isDeleting={deletingBookId !== null}
        onCancel={closeDeleteModal}
        onConfirm={handleDeleteBook}
      />
    </div>
  )
}
