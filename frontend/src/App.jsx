import { useEffect, useMemo, useState } from 'react'

import { createBook, fetchBooks } from './api'

const initialForm = {
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

export default function App() {
  const [form, setForm] = useState(initialForm)
  const [books, setBooks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  const totalBooksLabel = useMemo(() => {
    if (books.length === 1) {
      return '1 livro cadastrado'
    }

    return `${books.length} livros cadastrados`
  }, [books.length])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    try {
      setIsSubmitting(true)
      setError('')
      setSuccessMessage('')
      const createdBook = await createBook(form)
      setBooks((current) => [createdBook, ...current])
      setForm(initialForm)
      setSuccessMessage('Livro cadastrado com sucesso.')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
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
              <strong>{books.length}</strong>
              <span>{totalBooksLabel}</span>
            </div>
            <div className="stat-card">
              <strong>API</strong>
              <span>{import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}</span>
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
                  required
                />
              </label>

              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Cadastrar livro'}
              </button>
            </form>

            {successMessage ? <div className="feedback success">{successMessage}</div> : null}
            {error ? <div className="feedback error">{error}</div> : null}
          </div>

          <div className="panel list-panel">
            <div className="panel-header panel-header-inline">
              <div>
                <h2>Livros cadastrados</h2>
                <p>Lista atualizada com os registros disponíveis na API.</p>
              </div>
              <button type="button" className="secondary-button" onClick={loadBooks}>
                Atualizar
              </button>
            </div>

            {isLoading ? (
              <div className="empty-state">Carregando livros...</div>
            ) : books.length === 0 ? (
              <div className="empty-state">Nenhum livro cadastrado até o momento.</div>
            ) : (
              <div className="book-list">
                {books.map((book) => (
                  <article key={book.id} className="book-card">
                    <div className="book-card-header">
                      <span className="book-id">#{book.id}</span>
                      <span className="book-date">{formatDate(book.created_at)}</span>
                    </div>
                    <h3>{book.titulo}</h3>
                    <p>{book.autor}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
