import { useEffect, useMemo, useRef, useState } from 'react'

import BookFormPanel from './components/BookFormPanel'
import BookListPanel from './components/BookListPanel'
import DeleteBookModal from './components/DeleteBookModal'
import HeroSection from './components/HeroSection'
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
  const [form, setForm] = useState(initialForm)
  const [books, setBooks] = useState([])
  const [query, setQuery] = useState(defaultQuery)
  const [totalBooks, setTotalBooks] = useState(0)
  const [latestCreatedAt, setLatestCreatedAt] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [authorFilter, setAuthorFilter] = useState('')
  const [createdFromFilter, setCreatedFromFilter] = useState('')
  const [createdToFilter, setCreatedToFilter] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formTouched, setFormTouched] = useState({ titulo: false, autor: false })
  const [editingBookId, setEditingBookId] = useState(null)
  const [activeMenuBookId, setActiveMenuBookId] = useState(null)
  const [editForm, setEditForm] = useState(initialEditForm)
  const [editTouched, setEditTouched] = useState({ titulo: false, autor: false })
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
        created_from: params.createdFrom,
        created_to: params.createdTo,
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
        createdFrom: data.created_from ?? '',
        createdTo: data.created_to ?? '',
      })
      setSearchTerm(data.search)
      setAuthorFilter(data.author)
      setCreatedFromFilter(data.created_from ?? '')
      setCreatedToFilter(data.created_to ?? '')
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
      && createdFromFilter === query.createdFrom
      && createdToFilter === query.createdTo
    ) {
      return undefined
    }

    const timeoutId = window.setTimeout(() => {
      handleQueryUpdate({
        ...query,
        search: normalizedSearch,
        author: normalizedAuthor,
        createdFrom: createdFromFilter,
        createdTo: createdToFilter,
        offset: 0,
      })
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [authorFilter, createdFromFilter, createdToFilter, query, searchTerm])

  const totalBooksLabel = useMemo(() => {
    if (totalBooks === 1) {
      return '1 livro cadastrado'
    }

    return `${totalBooks} livros cadastrados`
  }, [totalBooks])

  const latestAdditionLabel = useMemo(() => {
    return formatLatestAddition(latestCreatedAt)
  }, [latestCreatedAt])

  const formErrors = useMemo(() => ({
    titulo: getTextFieldError('Título', form.titulo),
    autor: getTextFieldError('Autor', form.autor),
  }), [form.autor, form.titulo])

  const editErrors = useMemo(() => ({
    titulo: getTextFieldError('Título', editForm.titulo),
    autor: getTextFieldError('Autor', editForm.autor),
  }), [editForm.autor, editForm.titulo])

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

  function handleCreatedFromFilterChange(event) {
    setCreatedFromFilter(event.target.value)
  }

  function handleCreatedToFilterChange(event) {
    setCreatedToFilter(event.target.value)
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
    setCreatedFromFilter('')
    setCreatedToFilter('')
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
      setSuccessMessage('')
      await createBook(payload)
      await loadBooks({
        ...query,
        offset: 0,
      })
      setForm(initialForm)
      setFormTouched({ titulo: false, autor: false })
      setSuccessMessage('✓ Livro cadastrado com sucesso')
    } catch (err) {
      setError(err.message)
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
      setSuccessMessage('')
      await updateBook(bookId, payload)
      cancelEditing()
      await loadBooks(query)
      setSuccessMessage('✓ Livro atualizado com sucesso')
    } catch (err) {
      setError(err.message)
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

  return (
    <div className="app-shell">
      <div className="background-glow background-glow-left" />
      <div className="background-glow background-glow-right" />

      <main className="container">
        <HeroSection
          totalBooks={totalBooks}
          totalBooksLabel={totalBooksLabel}
          latestAdditionLabel={latestAdditionLabel}
        />

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
            createdFromFilter={createdFromFilter}
            createdToFilter={createdToFilter}
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
            onCreatedFromFilterChange={handleCreatedFromFilterChange}
            onCreatedToFilterChange={handleCreatedToFilterChange}
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
