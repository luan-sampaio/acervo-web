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
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingBookId, setEditingBookId] = useState(null)
  const [editForm, setEditForm] = useState(initialEditForm)
  const [savingBookId, setSavingBookId] = useState(null)
  const [deletingBookId, setDeletingBookId] = useState(null)
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

  const isFormValid = form.titulo.trim().length >= 2 && form.autor.trim().length >= 2
  const isEditFormValid = editForm.titulo.trim().length >= 2 && editForm.autor.trim().length >= 2

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleEditChange(event) {
    const { name, value } = event.target
    setEditForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function startEditing(book) {
    setError('')
    setEditingBookId(book.id)
    setEditForm({
      titulo: book.titulo,
      autor: book.autor,
    })
  }

  function cancelEditing() {
    setEditingBookId(null)
    setEditForm(initialEditForm)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!isFormValid) {
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
      setSuccessMessage('✓ Livro cadastrado com sucesso')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleUpdateBook(bookId) {
    if (!isEditFormValid) {
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

  async function handleDeleteBook(bookId) {
    const confirmed = window.confirm('Deseja remover este livro?')

    if (!confirmed) {
      return
    }

    try {
      setDeletingBookId(bookId)
      setError('')
      setSuccessMessage('')
      await deleteBook(bookId)
      setBooks((current) => current.filter((book) => book.id !== bookId))

      if (editingBookId === bookId) {
        cancelEditing()
      }

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
                  placeholder="Ex.: Dom Casmurro"
                  minLength={2}
                  required
                />
              </label>

              <label>
                <span>Autor</span>
                <input
                  name="autor"
                  value={form.autor}
                  onChange={handleChange}
                  placeholder="Ex.: Machado de Assis"
                  minLength={2}
                  required
                />
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

            {isLoading ? (
              <div className="empty-state">Carregando livros...</div>
            ) : displayBooks.length === 0 ? (
              <div className="empty-state">Nenhum livro cadastrado até o momento.</div>
            ) : (
              <div className="book-list">
                {displayBooks.map((book) => (
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
                                minLength={2}
                                required
                              />
                            </label>
                            <label>
                              <span>Autor</span>
                              <input
                                name="autor"
                                value={editForm.autor}
                                onChange={handleEditChange}
                                minLength={2}
                                required
                              />
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
                            onClick={() => handleDeleteBook(book.id)}
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
      </main>
    </div>
  )
}
