import { useCallback, useEffect, useRef, useState } from 'react'
import BookListPanel from '../components/BookListPanel'
import CreateBookModal from '../components/CreateBookModal'
import DeleteBookModal from '../components/DeleteBookModal'
import {
  readingStatusOptions,
  sortOptions,
} from '../constants'
import { useAnnotationMutations } from '../hooks/useAnnotationMutations'
import { useBookMutations } from '../hooks/useBookMutations'
import { useBooksQueryState } from '../hooks/useBooksQueryState'
import { getBookFieldErrorsFromApi } from '../services/apiErrors'
import { getTextFieldError } from '../utils'

export default function CollectionPage() {
  const [editingBookId, setEditingBookId] = useState(null)
  const [annotationBookId, setAnnotationBookId] = useState(null)
  const [annotationError, setAnnotationError] = useState('')
  const [activeMenuBookId, setActiveMenuBookId] = useState(null)
  const [bookPendingDelete, setBookPendingDelete] = useState(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const actionMenuRef = useRef(null)

  const {
    deleteAnnotationMutation,
    saveAnnotationMutation,
  } = useAnnotationMutations({
    setAnnotationBookId,
    setAnnotationError,
    setSuccessMessage,
  })

  const {
    deleteBookMutation,
    updateBookMutation,
  } = useBookMutations({
    annotationBookId,
    editingBookId,
    setAnnotationBookId,
    setAnnotationError,
    setBookPendingDelete,
    setEditingBookId,
    setSuccessMessage,
  })

  const cancelEditing = useCallback(() => {
    updateBookMutation.reset()
    setEditingBookId(null)
  }, [updateBookMutation])

  const closeAnnotationPanel = useCallback(() => {
    saveAnnotationMutation.reset()
    deleteAnnotationMutation.reset()
    setAnnotationBookId(null)
    setAnnotationError('')
  }, [deleteAnnotationMutation, saveAnnotationMutation])

  const closeOpenInteractions = useCallback(() => {
    setActiveMenuBookId(null)
    cancelEditing()
    closeAnnotationPanel()
  }, [cancelEditing, closeAnnotationPanel])

  const closeSearchInteractions = useCallback(() => {
    setActiveMenuBookId(null)
    cancelEditing()
  }, [cancelEditing])

  const {
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
  } = useBooksQueryState({
    onBeforeQueryChange: closeOpenInteractions,
    onBeforeSearchChange: closeSearchInteractions,
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

  const editServerErrors = getBookFieldErrorsFromApi(updateBookMutation.error)
  const editErrors = editingBookId === null ? { titulo: '', autor: '' } : editServerErrors
  const listError = booksQuery.error?.message
    ?? updateBookMutation.error?.message
    ?? saveAnnotationMutation.error?.message
    ?? deleteAnnotationMutation.error?.message
    ?? deleteBookMutation.error?.message
    ?? ''

  function toggleActionMenu(bookId) {
    setActiveMenuBookId((current) => (current === bookId ? null : bookId))
  }

  function openCreateModal() {
    setActiveMenuBookId(null)
    cancelEditing()
    closeAnnotationPanel()
    setIsCreateModalOpen(true)
  }

  function closeCreateModal() {
    setIsCreateModalOpen(false)
  }

  function startEditing(book) {
    updateBookMutation.reset()
    closeAnnotationPanel()
    setActiveMenuBookId(null)
    setEditingBookId(book.id)
  }

  function openAnnotationPanel(book) {
    cancelEditing()
    saveAnnotationMutation.reset()
    deleteAnnotationMutation.reset()
    setAnnotationError(
      book.status_leitura === 'lido'
        ? ''
        : 'Marque o livro como lido para registrar nota, resenha ou período de leitura.',
    )
    setActiveMenuBookId(null)
    setAnnotationBookId((current) => (current === book.id ? null : book.id))
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

  async function handleSaveAnnotation(book, event) {
    event.preventDefault()

    if (book.status_leitura !== 'lido') {
      setAnnotationError('Marque o livro como lido para registrar nota, resenha ou período de leitura.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const rawRating = String(formData.get('rating') ?? '')
    const review = String(formData.get('review') ?? '').trim()
    const startedAt = String(formData.get('started_at') ?? '')
    const finishedAt = String(formData.get('finished_at') ?? '')
    const payload = {
      rating: rawRating ? Number(rawRating) : null,
      review: review || null,
      started_at: startedAt || null,
      finished_at: finishedAt || null,
    }
    const hasAnnotation = Boolean(book.annotation)
    const hasAnyValue = Object.values(payload).some((value) => value !== null)

    if (!hasAnnotation && !hasAnyValue) {
      setAnnotationError('Informe ao menos uma nota, resenha ou data de leitura.')
      return
    }

    if (payload.started_at && payload.finished_at && payload.finished_at < payload.started_at) {
      setAnnotationError('A data de término não pode ser anterior à data de início.')
      return
    }

    setAnnotationError('')
    await saveAnnotationMutation.mutateAsync({
      bookId: book.id,
      payload,
      hasAnnotation,
    })
  }

  async function handleDeleteAnnotation(book) {
    if (!book.annotation || deleteAnnotationMutation.isPending) {
      return
    }

    await deleteAnnotationMutation.mutateAsync(book.id)
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

    await deleteBookMutation.mutateAsync({
      bookId: bookPendingDelete.id,
      query,
      totalBooks,
    })
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
          annotationBookId={annotationBookId}
          activeMenuBookId={activeMenuBookId}
          editErrors={editErrors}
          savingBookId={updateBookMutation.isPending ? updateBookMutation.variables?.bookId ?? null : null}
          savingAnnotationBookId={
            saveAnnotationMutation.isPending ? saveAnnotationMutation.variables?.bookId ?? null : null
          }
          deletingAnnotationBookId={
            deleteAnnotationMutation.isPending ? deleteAnnotationMutation.variables ?? null : null
          }
          annotationError={annotationError}
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
          onOpenAnnotation={openAnnotationPanel}
          onRequestDelete={requestDeleteBook}
          onSave={handleUpdateBook}
          onCancelEditing={cancelEditing}
          onSaveAnnotation={handleSaveAnnotation}
          onDeleteAnnotation={handleDeleteAnnotation}
          onCloseAnnotation={closeAnnotationPanel}
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
