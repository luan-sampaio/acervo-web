import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import BookFormPanel from './BookFormPanel'
import { initialForm, readingStatusOptions } from '../constants'
import { createBook, searchExternalBooks } from '../services/api'
import { getBookFieldErrorsFromApi } from '../services/apiErrors'
import { getTextFieldError } from '../utils'

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

export default function CreateBookModal({ onClose, onCreated }) {
  const queryClient = useQueryClient()
  const inputRef = useRef(null)
  const [mode, setMode] = useState('search')
  const [inputValue, setInputValue] = useState('')
  const [query, setQuery] = useState('')
  const [form, setForm] = useState(initialForm)
  const [formTouched, setFormTouched] = useState({ titulo: false, autor: false })
  const [selectedResult, setSelectedResult] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('quero_ler')

  const searchQuery = useQuery({
    queryKey: ['external-search', query],
    queryFn: () => searchExternalBooks(query),
    enabled: query.trim().length > 0,
    staleTime: 5 * 60 * 1000,
  })

  const createBookMutation = useMutation({
    mutationFn: createBook,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['books'] })
      onCreated({
        message: 'Livro cadastrado',
        detail: 'Ele já está disponível na sua coleção.',
      })
    },
  })

  const formServerErrors = getBookFieldErrorsFromApi(createBookMutation.error)
  const formErrors = useMemo(() => ({
    titulo: getTextFieldError('Título', form.titulo) || formServerErrors.titulo,
    autor: getTextFieldError('Autor', form.autor) || formServerErrors.autor,
  }), [form.autor, form.titulo, formServerErrors.autor, formServerErrors.titulo])
  const isFormValid = !formErrors.titulo && !formErrors.autor
  const results = searchQuery.data ?? []
  const hasQuery = query.trim().length > 0
  const isSearching = searchQuery.isFetching
  const searchErrorMessage = searchQuery.error?.message ?? 'Erro ao buscar livros.'
  const addErrorMessage = createBookMutation.error?.message ?? 'Erro ao adicionar livro.'

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  function handleOverlayClick(event) {
    if (event.target === event.currentTarget && !createBookMutation.isPending) {
      onClose()
    }
  }

  function handleSearch(event) {
    event.preventDefault()
    const nextQuery = inputValue.trim()

    if (!nextQuery) {
      return
    }

    setQuery(nextQuery)
    setSelectedResult(null)
  }

  function handleRetrySearch() {
    if (!query.trim()) {
      return
    }

    createBookMutation.reset()
    setSelectedResult(null)
    searchQuery.refetch()
  }

  function handleChange(event) {
    const { name, type, checked, value } = event.target
    createBookMutation.reset()
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleFieldBlur(event) {
    const { name } = event.target
    setFormTouched((current) => ({
      ...current,
      [name]: true,
    }))
  }

  async function handleAddBook(result) {
    await createBookMutation.mutateAsync({
      titulo: result.titulo,
      autor: result.autor,
      isbn: result.isbn ?? undefined,
      cover_url: result.cover_url ?? undefined,
      external_id: result.external_id,
      status_leitura: selectedStatus,
    })
  }

  function handleSelectResult(result) {
    if (result.already_in_library) {
      return
    }

    createBookMutation.reset()
    setSelectedStatus('quero_ler')
    setSelectedResult(result)
  }

  function handleCloseReview() {
    if (createBookMutation.isPending) {
      return
    }

    createBookMutation.reset()
    setSelectedResult(null)
    setSelectedStatus('quero_ler')
  }

  async function handleManualSubmit(event) {
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

  return (
    <div className="modal-overlay" role="presentation" onClick={handleOverlayClick}>
      <div className="modal-card create-book-modal" role="dialog" aria-modal="true" aria-labelledby="create-book-modal-title">
        <div className="create-book-modal-header">
          <div>
            <h2 id="create-book-modal-title">Novo livro</h2>
            <p>Busque no Google Books primeiro. Se nao encontrar, cadastre manualmente.</p>
          </div>
          <button type="button" className="create-book-close-button" onClick={onClose} disabled={createBookMutation.isPending} aria-label="Fechar">
            ✕
          </button>
        </div>

        <div className="create-book-mode-switch" role="tablist" aria-label="Modo de cadastro">
          <button
            type="button"
            className={mode === 'search' ? 'quick-filter-chip quick-filter-chip-active' : 'quick-filter-chip'}
            onClick={() => {
              setMode('search')
              createBookMutation.reset()
              window.setTimeout(() => inputRef.current?.focus(), 0)
            }}
          >
            Buscar no Google Books
          </button>
          <button
            type="button"
            className={mode === 'manual' ? 'quick-filter-chip quick-filter-chip-active' : 'quick-filter-chip'}
            onClick={() => {
              setMode('manual')
              createBookMutation.reset()
            }}
          >
            Cadastrar manualmente
          </button>
        </div>

        {mode === 'search' ? (
          <div className="create-book-modal-body">
            <form className="external-search-form create-book-search-form" onSubmit={handleSearch}>
              <label className="external-search-label">
                <input
                  ref={inputRef}
                  className="external-search-input"
                  type="search"
                  placeholder="Titulo, autor ou ISBN..."
                  value={inputValue}
                  onChange={(event) => setInputValue(event.target.value)}
                />
              </label>
              <button type="submit" className="action-button primary-button" disabled={isSearching || !inputValue.trim()}>
                {isSearching ? 'Pesquisando...' : 'Pesquisar'}
              </button>
            </form>

            {isSearching ? (
              <div className="search-status-banner search-status-banner-loading" role="status" aria-live="polite">
                <strong>Buscando resultados no Google Books...</strong>
                <span>Isso pode levar alguns segundos. Se nada aparecer, tente ISBN, titulo ou autor.</span>
              </div>
            ) : null}

            {searchQuery.isError ? (
              <div className="search-state-card search-state-card-error" role="alert">
                <strong>Nao foi possivel concluir a busca agora.</strong>
                <p>{searchErrorMessage}</p>
                <div className="search-state-actions">
                  <button type="button" className="action-button primary-button" onClick={handleRetrySearch}>
                    Tentar novamente
                  </button>
                  <button type="button" className="action-button secondary-button" onClick={() => setMode('manual')}>
                    Cadastrar manualmente
                  </button>
                </div>
              </div>
            ) : null}

            {createBookMutation.isError && mode === 'search' ? (
              <div className="search-state-card search-state-card-error" role="alert">
                <strong>O livro nao foi adicionado ao acervo.</strong>
                <p>{addErrorMessage}</p>
                <div className="search-state-actions">
                  {selectedResult ? (
                    <button type="button" className="action-button primary-button" onClick={() => handleAddBook(selectedResult)}>
                      Tentar adicionar novamente
                    </button>
                  ) : (
                    <button type="button" className="action-button primary-button" onClick={handleRetrySearch}>
                      Voltar para a busca
                    </button>
                  )}
                  <button type="button" className="action-button secondary-button" onClick={() => setMode('manual')}>
                    Cadastrar manualmente
                  </button>
                </div>
              </div>
            ) : null}

            {selectedResult ? (
              <div className="search-review-card">
                <div className="search-review-media">
                  <BookCover coverUrl={selectedResult.cover_url} titulo={selectedResult.titulo} />
                </div>

                <div className="search-review-content">
                  <div className="search-review-header">
                    <div>
                      <span className="search-review-kicker">Revisar antes de adicionar</span>
                      <h3>{selectedResult.titulo}</h3>
                      <p>{selectedResult.autor}</p>
                    </div>
                    <button
                      type="button"
                      className="action-button secondary-button"
                      onClick={handleCloseReview}
                      disabled={createBookMutation.isPending}
                    >
                      Voltar aos resultados
                    </button>
                  </div>

                  <div className="search-review-meta">
                    {selectedResult.isbn ? <p><strong>ISBN:</strong> {selectedResult.isbn}</p> : null}
                    {selectedResult.descricao ? <p>{selectedResult.descricao}</p> : null}
                  </div>

                  <div className="search-review-controls">
                    <label className="toolbar-select-field search-review-select">
                      <span>Status inicial</span>
                      <select
                        value={selectedStatus}
                        onChange={(event) => setSelectedStatus(event.target.value)}
                        disabled={createBookMutation.isPending}
                      >
                        {readingStatusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div className="search-review-actions">
                    <button
                      type="button"
                      className="action-button primary-button"
                      disabled={createBookMutation.isPending}
                      onClick={() => handleAddBook(selectedResult)}
                    >
                      {createBookMutation.isPending ? 'Adicionando...' : 'Confirmar e adicionar'}
                    </button>
                  </div>
                </div>
              </div>
            ) : !hasQuery ? (
              <div className="search-state-card search-state-card-neutral">
                <strong>Pesquise para importar um livro.</strong>
                <p>Voce pode tentar por titulo, autor ou ISBN. Se preferir, use o cadastro manual.</p>
                <div className="search-state-actions">
                  <button type="button" className="action-button secondary-button" onClick={() => setMode('manual')}>
                    Cadastrar manualmente
                  </button>
                </div>
              </div>
            ) : isSearching ? (
              <div className="search-results-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="search-result-card search-result-card-skeleton">
                    <div className="search-result-cover search-result-cover-skeleton" />
                    <div className="search-result-info">
                      <div className="skeleton-line skeleton-line-md" />
                      <div className="skeleton-line skeleton-line-sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="search-state-card search-state-card-empty">
                <strong>Nenhum resultado encontrado para "{query}".</strong>
                <p>Tente outro termo, busque pelo ISBN ou siga com o cadastro manual.</p>
                <div className="search-state-actions">
                  <button type="button" className="action-button secondary-button" onClick={handleRetrySearch}>
                    Pesquisar novamente
                  </button>
                  <button type="button" className="action-button secondary-button" onClick={() => setMode('manual')}>
                    Cadastrar manualmente
                  </button>
                </div>
              </div>
            ) : (
              <div className="search-results-grid">
                {results.map((result) => {
                  const isAdding = createBookMutation.isPending && createBookMutation.variables?.external_id === result.external_id

                  return (
                    <article key={result.external_id} className="search-result-card">
                      <BookCover coverUrl={result.cover_url} titulo={result.titulo} />
                      <div className="search-result-info">
                        <h3 className="search-result-title" title={result.titulo}>{result.titulo}</h3>
                        <p className="search-result-author">{result.autor}</p>
                        {result.already_in_library ? (
                          <span className="search-result-badge">Ja esta no acervo</span>
                        ) : null}
                        {result.isbn ? <p className="search-result-isbn">ISBN {result.isbn}</p> : null}
                        {result.descricao ? <p className="search-result-description">{result.descricao}</p> : null}
                        <button
                          type="button"
                          className={`action-button ${result.already_in_library ? 'secondary-button' : 'primary-button'} search-add-button`}
                          disabled={result.already_in_library || isAdding || createBookMutation.isPending}
                          onClick={() => handleSelectResult(result)}
                        >
                          {result.already_in_library ? 'Ja adicionado' : isAdding ? 'Adicionando...' : 'Revisar e adicionar'}
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="create-book-modal-body">
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
              onSubmit={handleManualSubmit}
              variant="embedded"
              onCancel={onClose}
              title="Cadastro manual"
              description="Use esse caminho quando o livro nao aparecer na busca externa."
              submitLabel="Cadastrar manualmente"
            />
          </div>
        )}
      </div>
    </div>
  )
}
