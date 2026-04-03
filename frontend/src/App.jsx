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
  pageSizeOptions,
  sortOptions,
  sortOrderOptions,
} from './constants'
import { createBook, deleteBook, fetchBooks, updateBook } from './api'
import { formatLatestAddition, getTextFieldError } from './utils'

export default function App() {
  const [currentView, setCurrentView] = useState('home')
  const [form, setForm] = useState(initialForm)
  const [books, setBooks] = useState([])
  const [query, setQuery] = useState(defaultQuery)
  const [totalBooks, setTotalBooks] = useState(0)
  const [latestCreatedAt, setLatestCreatedAt] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
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
        author: params.author,
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
        author: data.author,
      })
      setSearchTerm(data.search)
      setAuthorFilter(data.author)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBooks(defaultQuery)
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
    const normalizedSearch = searchTerm.trim()
    const normalizedAuthor = authorFilter.trim()

    if (
      normalizedSearch === query.search
      && normalizedAuthor === query.author
    ) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      handleQueryUpdate({
        ...query,
        search: normalizedSearch,
        author: normalizedAuthor,
        offset: 0,
      })
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [authorFilter, query, searchTerm])

  const latestAdditionLabel = useMemo(() => {
    return formatLatestAddition(latestCreatedAt)
  }, [latestCreatedAt])

  const recentBooks = useMemo(() => {
    return [...books]
      .sort((firstBook, secondBook) => {
        return new Date(secondBook.created_at).getTime() - new Date(firstBook.created_at).getTime()
      })
      .slice(0, 4)
  }, [books])

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
    const { name, value } = event.target
    setServerFormErrors((current) => ({
      ...current,
      [name]: '',
    }))
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleSearchChange(event) {
    setSearchTerm(event.target.value)
  }

  function handleAuthorFilterChange(event) {
    setAuthorFilter(event.target.value)
  }

  function handleFieldBlur(event) {
    const { name } = event.target
    setFormTouched((current) => ({
      ...current,
      [name]: true,
    }))
  }

  function handleEditChange(event) {
    const { name, value } = event.target
    setServerEditErrors((current) => ({
      ...current,
      [name]: '',
    }))
    setEditForm((current) => ({
      ...current,
      [name]: value,
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

  function handlePageSizeChange(event) {
    const nextLimit = Number(event.target.value)
    handleQueryUpdate({
      ...query,
      limit: nextLimit,
      offset: 0,
    })
  }

  function handleClearFilters() {
    setSearchTerm('')
    setAuthorFilter('')
  }

  function handleNavigate(view) {
    setCurrentView(view)
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
      setForm(initialForm)
      setFormTouched({ titulo: false, autor: false })
      setServerFormErrors({ titulo: '', autor: '' })
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
    }

    try {
      setSavingBookId(bookId)
      setError('')
      setServerEditErrors({ titulo: '', autor: '' })
      setSuccessMessage('')
      await updateBook(bookId, payload)
      cancelEditing()
      await loadBooks(query)
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
        <BookFormPanel
          form={form}
          formErrors={formErrors}
          formTouched={formTouched}
          isFormValid={isFormValid}
          isSubmitting={isSubmitting}
          error={error}
          onChange={handleChange}
          onBlur={handleFieldBlur}
          onSubmit={handleSubmit}
        />

        <BookListPanel
          books={books}
          totalBooks={totalBooks}
          filteredBooks={books}
          query={query}
          searchTerm={searchTerm}
          authorFilter={authorFilter}
          isLoading={isLoading}
          editingBookId={editingBookId}
          activeMenuBookId={activeMenuBookId}
          editForm={editForm}
          editErrors={editErrors}
          editTouched={editTouched}
          savingBookId={savingBookId}
          currentPage={currentPage}
          totalPages={totalPages}
          visibleRangeStart={visibleRangeStart}
          visibleRangeEnd={visibleRangeEnd}
          hasPreviousPage={hasPreviousPage}
          hasNextPage={hasNextPage}
          actionMenuRef={actionMenuRef}
          onSearchChange={handleSearchChange}
          onAuthorFilterChange={handleAuthorFilterChange}
          onClearFilters={handleClearFilters}
          pageSizeOptions={pageSizeOptions}
          sortOptions={sortOptions}
          sortOrderOptions={sortOrderOptions}
          onSortByChange={handleSortByChange}
          onSortOrderChange={handleSortOrderChange}
          onPageSizeChange={handlePageSizeChange}
          onPreviousPage={handlePreviousPage}
          onNextPage={handleNextPage}
          onEditChange={handleEditChange}
          onEditBlur={handleEditBlur}
          onToggleMenu={toggleActionMenu}
          onStartEditing={startEditing}
          onRequestDelete={requestDeleteBook}
          onSave={handleUpdateBook}
          onCancelEditing={cancelEditing}
        />
      </section>
    )
  }

  return (
    <div className="app-shell">
      <div className="background-glow background-glow-left" />
      <div className="background-glow background-glow-right" />

      <main className="container">
        <AppHeader currentView={currentView} onNavigate={handleNavigate} />

        {currentView === 'home' ? (
          <HomeOverview
            onOpenDashboard={() => setCurrentView('dashboard')}
            onOpenCollection={() => setCurrentView('collection')}
          />
        ) : currentView === 'dashboard' ? (
          <DashboardOverview
            totalBooks={totalBooks}
            latestAdditionLabel={latestAdditionLabel}
            recentBooks={recentBooks}
            onOpenCollection={() => setCurrentView('collection')}
          />
        ) : (
          renderCollectionContent()
        )}

        {successMessage ? <div className="toast toast-success">{successMessage}</div> : null}

        <DeleteBookModal
          book={bookPendingDelete}
          isDeleting={deletingBookId !== null}
          onCancel={closeDeleteModal}
          onConfirm={handleDeleteBook}
        />
      </main>
    </div>
  )
}
