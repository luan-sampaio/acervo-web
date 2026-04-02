import { useEffect, useMemo, useState } from 'react'

import { createBook, deleteBook, fetchBooks, updateBook } from './api'

const initialForm = {
  titulo: '',
  autor: '',
}

const initialEditForm = {
  titulo: '',
  autor: '',
}

function getTextFieldError(label, value) {
  const trimmedValue = value.trim()

  if (trimmedValue.length === 0) {
    return `${label} é obrigatório`
  }

  if (trimmedValue.length < 2) {
    return `${label} deve ter pelo menos 2 caracteres`
  }

  return ''
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}


function formatLatestAddition(value) {
  if (!value) {
    return 'Sem registros recentes'
  }

  const date = new Date(value)
  const now = new Date()

  const isToday = date.toDateString() === now.toDateString()

  if (isToday) {
    return `Hoje, ${new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(date)}`
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export default function App() {
  const [form, setForm] = useState(initialForm)
  const [books, setBooks] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formTouched, setFormTouched] = useState({ titulo: false, autor: false })
  const [editingBookId, setEditingBookId] = useState(null)
  const [editForm, setEditForm] = useState(initialEditForm)
  const [editTouched, setEditTouched] = useState({ titulo: false, autor: false })
  const [savingBookId, setSavingBookId] = useState(null)
  const [deletingBookId, setDeletingBookId] = useState(null)
  const [bookPendingDelete, setBookPendingDelete] = useState(null)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  async function loadBooks() {
    try {
      setIsLoading(true)
      setError('')
      const data = await fetchBooks()
      setBooks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBooks()
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

  const displayBooks = useMemo(() => {
    return [...books]
      .sort((first, second) => {
        const firstDate = first.created_at ? new Date(first.created_at).getTime() : 0
        const secondDate = second.created_at ? new Date(second.created_at).getTime() : 0

        return secondDate - firstDate || second.id - first.id
      })
  }, [books])

  const totalBooksLabel = useMemo(() => {
    if (displayBooks.length === 1) {
      return '1 livro cadastrado'
    }

    return `${displayBooks.length} livros cadastrados`
  }, [displayBooks.length])

  const latestAdditionLabel = useMemo(() => {
    return formatLatestAddition(displayBooks[0]?.created_at)
  }, [displayBooks])

  const filteredBooks = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase()

    if (!normalizedSearchTerm) {
      return displayBooks
    }

    return displayBooks.filter((book) => {
      return (
        book.titulo.toLowerCase().includes(normalizedSearchTerm)
        || book.autor.toLowerCase().includes(normalizedSearchTerm)
      )
    })
  }, [displayBooks, searchTerm])

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

  function startEditing(book) {
    setError('')
    setEditingBookId(book.id)
    setEditForm({
      titulo: book.titulo,
      autor: book.autor,
    })
    setEditTouched({ titulo: false, autor: false })
  }

  function cancelEditing() {
    setEditingBookId(null)
    setEditForm(initialEditForm)
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
      const createdBook = await createBook(payload)
      setBooks((current) => [createdBook, ...current])
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
      const updatedBook = await updateBook(bookId, payload)
      setBooks((current) => current.map((book) => (book.id === bookId ? updatedBook : book)))
      cancelEditing()
      setSuccessMessage('✓ Livro atualizado com sucesso')
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingBookId(null)
    }
  }

  function requestDeleteBook(book) {
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
      setBooks((current) => current.filter((book) => book.id !== bookId))

      if (editingBookId === bookId) {
        cancelEditing()
      }

      setBookPendingDelete(null)
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
        <section className="hero-card">
          <span className="eyebrow">Book Registry</span>
          <h1>Cadastre e acompanhe sua coleção de livros</h1>
          <p>
            Uma interface simples para registrar títulos e visualizar rapidamente
            o acervo salvo na API FastAPI.
          </p>
          <div className="hero-stats">
            <div className="stat-card">
              <strong>{displayBooks.length}</strong>
              <span>{totalBooksLabel}</span>
            </div>
            <div className="stat-card">
              <strong>Última adição</strong>
              <span>{latestAdditionLabel}</span>
            </div>
          </div>
        </section>

        <section className="content-grid">
          <div className="panel form-panel">
            <div className="panel-header">
              <h2>Novo livro</h2>
              <p>Preencha os dados básicos para registrar um livro.</p>
            </div>

            <form className="book-form" onSubmit={handleSubmit}>
              <label>
                <span>Título</span>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  onBlur={handleFieldBlur}
                  placeholder="Ex.: Dom Casmurro"
                  aria-invalid={formTouched.titulo && Boolean(formErrors.titulo)}
                  className={formTouched.titulo && formErrors.titulo ? 'input-error' : ''}
                  minLength={2}
                  required
                />
                {formTouched.titulo && formErrors.titulo ? <span className="field-error">{formErrors.titulo}</span> : null}
              </label>

              <label>
                <span>Autor</span>
                <input
                  name="autor"
                  value={form.autor}
                  onChange={handleChange}
                  onBlur={handleFieldBlur}
                  placeholder="Ex.: Machado de Assis"
                  aria-invalid={formTouched.autor && Boolean(formErrors.autor)}
                  className={formTouched.autor && formErrors.autor ? 'input-error' : ''}
                  minLength={2}
                  required
                />
                {formTouched.autor && formErrors.autor ? <span className="field-error">{formErrors.autor}</span> : null}
              </label>

              <button type="submit" disabled={isSubmitting || !isFormValid}>
                {isSubmitting ? 'Salvando...' : 'Cadastrar livro'}
              </button>
            </form>

            {error ? <div className="feedback error">{error}</div> : null}
          </div>

          <div className="panel list-panel">
            <div className="panel-header panel-header-inline">
              <div>
                <h2>Livros cadastrados</h2>
                <p>Lista atualizada com os registros disponíveis na API.</p>
              </div>
              <div className="sync-status" aria-label="Sincronizado">
                <span className="sync-icon">✓</span>
                <span>Sincronizado</span>
              </div>
            </div>

            <div className="list-toolbar">
              <label className="search-field">
                <span>Buscar por título ou autor</span>
                <input
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Ex.: Machado de Assis"
                />
              </label>

              {searchTerm ? (
                <button type="button" className="secondary-button" onClick={() => setSearchTerm('')}>
                  Limpar
                </button>
              ) : null}
            </div>

            {isLoading ? (
              <div className="empty-state">Carregando livros...</div>
            ) : filteredBooks.length === 0 ? (
              <div className="empty-state">
                {searchTerm ? 'Nenhum livro encontrado para a busca informada.' : 'Nenhum livro cadastrado até o momento.'}
              </div>
            ) : displayBooks.length === 0 ? (
              <div className="empty-state">Nenhum livro cadastrado até o momento.</div>
            ) : (
              <div className="book-list">
                {filteredBooks.map((book) => (
                  <article key={book.id} className="book-card">
                    <div className="book-card-top">
                      {editingBookId === book.id ? (
                        <div className="book-main book-main-editing">
                          <div className="inline-form">
                            <label>
                              <span>Título</span>
                              <input
                                name="titulo"
                                value={editForm.titulo}
                                onChange={handleEditChange}
                                onBlur={handleEditBlur}
                                aria-invalid={editTouched.titulo && Boolean(editErrors.titulo)}
                                className={editTouched.titulo && editErrors.titulo ? 'input-error' : ''}
                                minLength={2}
                                required
                              />
                              {editTouched.titulo && editErrors.titulo ? <span className="field-error">{editErrors.titulo}</span> : null}
                            </label>
                            <label>
                              <span>Autor</span>
                              <input
                                name="autor"
                                value={editForm.autor}
                                onChange={handleEditChange}
                                onBlur={handleEditBlur}
                                aria-invalid={editTouched.autor && Boolean(editErrors.autor)}
                                className={editTouched.autor && editErrors.autor ? 'input-error' : ''}
                                minLength={2}
                                required
                              />
                              {editTouched.autor && editErrors.autor ? <span className="field-error">{editErrors.autor}</span> : null}
                            </label>
                          </div>
                        </div>
                      ) : (
                        <div className="book-main">
                          <h3>{book.titulo}</h3>
                          <p className="book-author">{book.autor}</p>
                        </div>
                      )}
                      <div className="book-meta">
                        <span className="book-id">#{book.id}</span>
                        <span className="book-date">{formatDate(book.created_at)}</span>
                      </div>
                    </div>

                    <div className="book-actions">
                      {editingBookId === book.id ? (
                        <>
                          <button
                            type="button"
                            className="action-button primary-button"
                            disabled={savingBookId === book.id || !isEditFormValid}
                            onClick={() => handleUpdateBook(book.id)}
                          >
                            {savingBookId === book.id ? 'Salvando...' : 'Salvar'}
                          </button>
                          <button
                            type="button"
                            className="action-button secondary-button"
                            disabled={savingBookId === book.id}
                            onClick={cancelEditing}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="action-button secondary-button"
                            disabled={deletingBookId === book.id}
                            onClick={() => startEditing(book)}
                          >
                            Editar
                          </button>
                          <button
                            type="button"
                            className="action-button danger-button"
                            disabled={deletingBookId === book.id}
                            onClick={() => requestDeleteBook(book)}
                          >
                            {deletingBookId === book.id ? 'Removendo...' : 'Excluir'}
                          </button>
                        </>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {successMessage ? <div className="toast toast-success">{successMessage}</div> : null}

        {bookPendingDelete ? (
          <div className="modal-overlay" role="presentation">
            <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
              <h3 id="delete-modal-title">Confirmar exclusão</h3>
              <p>
                Tem certeza que deseja remover <strong>{bookPendingDelete.titulo}</strong> de <strong>{bookPendingDelete.autor}</strong>?
              </p>
              <div className="modal-actions">
                <button type="button" className="action-button secondary-button" disabled={deletingBookId !== null} onClick={closeDeleteModal}>
                  Cancelar
                </button>
                <button type="button" className="action-button danger-button" disabled={deletingBookId !== null} onClick={handleDeleteBook}>
                  {deletingBookId !== null ? 'Excluindo...' : 'Confirmar exclusão'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
