import { useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBook, searchExternalBooks } from '../services/api'

function BookCover({ coverUrl, titulo }) {
  if (coverUrl) {
    return <img className="search-result-cover" src={coverUrl} alt={`Capa de ${titulo}`} loading="lazy" />
  }
  return (
    <div className="search-result-cover search-result-cover-placeholder" aria-hidden="true">
      <span>📖</span>
    </div>
  )
}

export default function SearchPage() {
  const queryClient = useQueryClient()
  const [inputValue, setInputValue] = useState('')
  const [query, setQuery] = useState('')
  const [addedIds, setAddedIds] = useState(new Set())
  const [successMessage, setSuccessMessage] = useState('')
  const inputRef = useRef(null)

  const searchQuery = useQuery({
    queryKey: ['external-search', query],
    queryFn: () => searchExternalBooks(query),
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  })

  const addBookMutation = useMutation({
    mutationFn: createBook,
    onSuccess: (_, payload) => {
      if (payload.external_id) {
        setAddedIds((prev) => new Set([...prev, payload.external_id]))
      }
      setSuccessMessage('✓ Livro adicionado ao acervo')
      setTimeout(() => setSuccessMessage(''), 3200)
      queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })

  function handleSearch(event) {
    event.preventDefault()
    const q = inputValue.trim()
    if (!q) return
    setQuery(q)
  }

  function handleAddBook(result) {
    addBookMutation.mutate({
      titulo: result.titulo,
      autor: result.autor,
      isbn: result.isbn ?? undefined,
      cover_url: result.cover_url ?? undefined,
      external_id: result.external_id,
    })
  }

  const results = searchQuery.data ?? []
  const isSearching = searchQuery.isFetching
  const hasQuery = query.trim().length > 0

  return (
    <section className="search-page">
      <div className="search-page-header">
        <h2>Buscar livros</h2>
        <p>Pesquise no Google Books e adicione títulos ao seu acervo.</p>
      </div>

      <form className="external-search-form" onSubmit={handleSearch}>
        <label className="external-search-label">
          <input
            ref={inputRef}
            className="external-search-input"
            type="search"
            placeholder="Título, autor ou ISBN..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </label>
        <button type="submit" className="action-button primary-button" disabled={isSearching || !inputValue.trim()}>
          {isSearching ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {searchQuery.isError ? (
        <div className="feedback error search-feedback">{searchQuery.error?.message ?? 'Erro ao buscar livros.'}</div>
      ) : null}

      {!hasQuery ? (
        <div className="search-empty-state">
          <p>Digite um título ou autor para começar.</p>
        </div>
      ) : isSearching ? (
        <div className="search-results-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="search-result-card search-result-card-skeleton">
              <div className="search-result-cover search-result-cover-skeleton" />
              <div className="search-result-info">
                <div className="skeleton-line skeleton-line-md" />
                <div className="skeleton-line skeleton-line-sm" />
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="search-empty-state">
          <p>Nenhum resultado para "<strong>{query}</strong>".</p>
        </div>
      ) : (
        <div className="search-results-grid">
          {results.map((result) => {
            const alreadyAdded = addedIds.has(result.external_id)
            const isAdding = addBookMutation.isPending && addBookMutation.variables?.external_id === result.external_id

            return (
              <article key={result.external_id} className="search-result-card">
                <BookCover coverUrl={result.cover_url} titulo={result.titulo} />
                <div className="search-result-info">
                  <h3 className="search-result-title" title={result.titulo}>{result.titulo}</h3>
                  <p className="search-result-author">{result.autor}</p>
                  {result.isbn ? <p className="search-result-isbn">ISBN {result.isbn}</p> : null}
                  {result.descricao ? (
                    <p className="search-result-description">{result.descricao}</p>
                  ) : null}
                  <button
                    type="button"
                    className={`action-button ${alreadyAdded ? 'secondary-button' : 'primary-button'} search-add-button`}
                    disabled={alreadyAdded || isAdding || addBookMutation.isPending}
                    onClick={() => handleAddBook(result)}
                  >
                    {isAdding ? 'Adicionando…' : alreadyAdded ? '✓ Adicionado' : 'Adicionar ao acervo'}
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {successMessage ? <div className="toast toast-success">{successMessage}</div> : null}
    </section>
  )
}
