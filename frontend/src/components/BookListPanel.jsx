import { formatRatingLabel, formatReadingPeriod, formatShortDate } from '../utils'

function getReadingStatusLabel(value, readingStatusOptions) {
  return readingStatusOptions.find((option) => option.value === value)?.label ?? value
}

function getReadingStatusClassName(value) {
  if (value === 'quero_ler') return 'book-status-badge-want'
  if (value === 'lendo') return 'book-status-badge-reading'
  if (value === 'lido') return 'book-status-badge-finished'
  return ''
}

function BookCoverThumbnail({ book }) {
  if (book.cover_url) {
    return (
      <img
        className="book-cover-thumbnail"
        src={book.cover_url}
        alt={`Capa de ${book.titulo}`}
        loading="lazy"
      />
    )
  }

  return (
    <div className="book-cover-thumbnail book-cover-thumbnail-placeholder" aria-hidden="true">
      <span>Livro</span>
    </div>
  )
}

function BookCard({
  book,
  isEditing,
  isAnnotationOpen,
  editErrors,
  isSaving,
  isSavingAnnotation,
  isDeletingAnnotation,
  annotationError,
  readingStatusOptions,
  activeMenuBookId,
  actionMenuRef,
  onToggleMenu,
  onStartEditing,
  onOpenAnnotation,
  onRequestDelete,
  onSave,
  onCancelEditing,
  onSaveAnnotation,
  onDeleteAnnotation,
  onCloseAnnotation,
}) {
  const annotation = book.annotation
  const ratingValue = annotation?.rating ? String(annotation.rating) : ''
  const ratingLabel = formatRatingLabel(annotation?.rating)
  const readingPeriod = formatReadingPeriod(annotation)
  const reviewPreview = annotation?.review?.trim() ?? ''
  const canAnnotate = book.status_leitura === 'lido'
  const hasReadingSummaryDetails = Boolean(ratingLabel || readingPeriod || reviewPreview)

  return (
    <article key={book.id} className={`book-card ${isEditing ? 'book-card-editing' : ''}`}>
      <div className="book-card-top">
        {isEditing ? (
          <form id={`edit-book-${book.id}`} className="book-main book-main-editing" onSubmit={(event) => onSave(book.id, event)}>
            <div className="inline-form">
              <label>
                <span>Título</span>
                <input
                  name="titulo"
                  defaultValue={book.titulo}
                  aria-invalid={Boolean(editErrors.titulo)}
                  className={editErrors.titulo ? 'input-error' : ''}
                  minLength={2}
                  required
                />
                {editErrors.titulo ? <span className="field-error">{editErrors.titulo}</span> : null}
              </label>
              <label>
                <span>Autor</span>
                <input
                  name="autor"
                  defaultValue={book.autor}
                  aria-invalid={Boolean(editErrors.autor)}
                  className={editErrors.autor ? 'input-error' : ''}
                  minLength={2}
                  required
                />
                {editErrors.autor ? <span className="field-error">{editErrors.autor}</span> : null}
              </label>
              <label>
                <span>Status de leitura</span>
                <select name="status_leitura" defaultValue={book.status_leitura}>
                  {readingStatusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="checkbox-field checkbox-field-inline">
                <input
                  type="checkbox"
                  name="favorito"
                  defaultChecked={book.favorito}
                />
                <span>Favorito</span>
              </label>
            </div>
          </form>
        ) : (
          <>
            <BookCoverThumbnail book={book} />

            <div className="book-main">
              <h3>{book.titulo}</h3>
              <p className="book-author">{book.autor}</p>
              <div className="book-badges">
                <span className={`book-status-badge ${getReadingStatusClassName(book.status_leitura)}`}>
                  {getReadingStatusLabel(book.status_leitura, readingStatusOptions)}
                </span>
                {book.favorito ? <span className="book-favorite-badge">Favorito</span> : null}
              </div>

              {canAnnotate ? (
                <div className="book-reading-summary">
                  <div className="book-reading-summary-tags">
                    {hasReadingSummaryDetails ? (
                      <>
                        {ratingLabel ? <span>{ratingLabel}</span> : null}
                        {readingPeriod ? <span>{readingPeriod}</span> : null}
                      </>
                    ) : (
                      <span className="book-reading-summary-placeholder">Sem avaliação</span>
                    )}
                  </div>
                  <p className={reviewPreview ? '' : 'book-reading-summary-empty'}>
                    {reviewPreview || 'Nenhuma resenha registrada'}
                  </p>
                </div>
              ) : null}

              <div className="book-card-footer">
                <span className="book-date">Adicionado em {formatShortDate(book.created_at)}</span>
              </div>
            </div>
          </>
        )}

        <div className="book-meta">
          {isEditing ? null : (
            <div className="book-menu" ref={activeMenuBookId === book.id ? actionMenuRef : null}>
              <button
                type="button"
                className="menu-trigger menu-trigger-icon"
                aria-label={`Ações do livro ${book.titulo}`}
                title="Ações"
                aria-haspopup="menu"
                aria-expanded={activeMenuBookId === book.id}
                onClick={() => onToggleMenu(book.id)}
              >
                <span aria-hidden="true">⋮</span>
              </button>

              {activeMenuBookId === book.id ? (
                <div className="card-menu" role="menu">
                  {canAnnotate ? (
                    <button type="button" role="menuitem" onClick={() => onOpenAnnotation(book)}>
                      <span className="card-menu-icon" aria-hidden="true">✎</span>
                      <span>Anotações</span>
                    </button>
                  ) : null}
                  <button type="button" role="menuitem" onClick={() => onStartEditing(book)}>
                    <span className="card-menu-icon" aria-hidden="true">✐</span>
                    <span>Editar</span>
                  </button>
                  <button type="button" role="menuitem" className="card-menu-danger" onClick={() => onRequestDelete(book)}>
                    <span className="card-menu-icon" aria-hidden="true">×</span>
                    <span>Excluir</span>
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="book-actions">
          <button
            type="submit"
            form={`edit-book-${book.id}`}
            className="action-button primary-button"
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            className="action-button secondary-button"
            disabled={isSaving}
            onClick={onCancelEditing}
          >
            Cancelar
          </button>
        </div>
      ) : null}

      {!isEditing && isAnnotationOpen && canAnnotate ? (
        <form
          key={`${book.id}-${annotation?.updated_at ?? 'new'}`}
          className="annotation-panel"
          onSubmit={(event) => onSaveAnnotation(book, event)}
        >
          <div className="annotation-panel-header">
            <div>
              <span className="annotation-kicker">Anotações de leitura</span>
              <strong>{annotation ? 'Atualize sua leitura' : 'Registre sua leitura'}</strong>
            </div>
            <button
              type="button"
              className="annotation-close-button"
              onClick={onCloseAnnotation}
              aria-label="Fechar anotações"
              disabled={isSavingAnnotation || isDeletingAnnotation}
            >
              ×
            </button>
          </div>

          <div className="annotation-grid">
            <label>
              <span>Nota</span>
              <select name="rating" defaultValue={ratingValue}>
                <option value="">Sem nota</option>
                <option value="1">1 estrela</option>
                <option value="2">2 estrelas</option>
                <option value="3">3 estrelas</option>
                <option value="4">4 estrelas</option>
                <option value="5">5 estrelas</option>
              </select>
            </label>

            <label>
              <span>Início</span>
              <input type="date" name="started_at" defaultValue={annotation?.started_at ?? ''} />
            </label>

            <label>
              <span>Término</span>
              <input type="date" name="finished_at" defaultValue={annotation?.finished_at ?? ''} />
            </label>
          </div>

          <label className="annotation-review-field">
            <span>Resenha</span>
            <textarea
              name="review"
              defaultValue={annotation?.review ?? ''}
              maxLength={5000}
              rows={4}
              placeholder="Escreva uma impressão, resumo ou comentário sobre a leitura."
            />
          </label>

          {annotationError ? <span className="field-error">{annotationError}</span> : null}

          <div className="annotation-actions">
            {annotation ? (
              <button
                type="button"
                className="action-button danger-button"
                disabled={isSavingAnnotation || isDeletingAnnotation}
                onClick={() => onDeleteAnnotation(book)}
              >
                {isDeletingAnnotation ? 'Removendo...' : 'Remover'}
              </button>
            ) : null}
            <button
              type="submit"
              className="action-button primary-button"
              disabled={isSavingAnnotation || isDeletingAnnotation}
            >
              {isSavingAnnotation ? 'Salvando...' : 'Salvar anotação'}
            </button>
          </div>
        </form>
      ) : null}
    </article>
  )
}

export default function BookListPanel({
  books,
  totalBooks,
  query,
  searchTerm,
  isLoading,
  editingBookId,
  annotationBookId,
  activeMenuBookId,
  editErrors,
  savingBookId,
  savingAnnotationBookId,
  deletingAnnotationBookId,
  annotationError,
  readingStatusOptions,
  currentPage,
  totalPages,
  visibleRangeStart,
  visibleRangeEnd,
  hasPreviousPage,
  hasNextPage,
  actionMenuRef,
  onSearchChange,
  onClearFilters,
  sortOptions,
  onSortByChange,
  onToggleSortOrder,
  onPreviousPage,
  onNextPage,
  onToggleMenu,
  onStartEditing,
  onOpenAnnotation,
  onRequestDelete,
  onSave,
  onCancelEditing,
  onSaveAnnotation,
  onDeleteAnnotation,
  onCloseAnnotation,
  onOpenCreateModal,
  onStatusFilterChange,
  error,
}) {
  const quickFilters = [
    { value: 'all', label: 'Todos' },
    ...readingStatusOptions.map((option) => ({
      value: option.value,
      label: option.label,
    })),
    { value: 'favorito', label: 'Favorito' },
  ]
  const hasActiveFilters = Boolean(searchTerm) || query.statusFilter !== 'all'

  return (
    <div className="panel list-panel">
      <div className="panel-header panel-header-inline">
        <div className="list-header-copy">
          <h2>Livros cadastrados</h2>
          <p>Acompanhe, filtre e organize os livros registrados na sua biblioteca.</p>
        </div>
        <div className="list-header-actions">
          <button type="button" className="action-button primary-button list-create-button" onClick={onOpenCreateModal}>
            + Novo livro
          </button>
        </div>
      </div>

      {error ? <div className="feedback error list-feedback">{error}</div> : null}

      <div className="list-toolbar">
        <div className="toolbar-grid toolbar-grid-compact">
          <label className="search-field search-field-wide">
            <span>Filtrar livros</span>
            <input
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Ex.: Machado de Assis"
            />
          </label>

          <div className="toolbar-sort-group">
            <label className="toolbar-select-field">
              <span>Ordenar por</span>
              <select value={query.sortBy} onChange={onSortByChange}>
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              className="secondary-button sort-order-toggle"
              onClick={onToggleSortOrder}
              aria-label={query.sortOrder === 'asc' ? 'Ordem crescente' : 'Ordem decrescente'}
              title={query.sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
            >
              <span className="sort-order-toggle-icon">{query.sortOrder === 'asc' ? '↑' : '↓'}</span>
            </button>
          </div>
        </div>

        <div className="quick-filter-row" aria-label="Filtros rápidos">
          {quickFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={query.statusFilter === filter.value ? 'quick-filter-chip quick-filter-chip-active' : 'quick-filter-chip'}
              onClick={() => onStatusFilterChange(filter.value)}
            >
              {filter.label}
            </button>
          ))}
          {hasActiveFilters ? (
            <button type="button" className="toolbar-clear-button toolbar-clear-button-inline" onClick={onClearFilters}>
              Limpar filtros
            </button>
          ) : null}
        </div>
      </div>

      <div className="list-content-shell">
        <div className="list-scroll-area">
          {isLoading ? (
            <div className="empty-state">
              <div className="empty-state-card">
                <strong>Carregando livros</strong>
                <p>Atualizando a colecao...</p>
              </div>
            </div>
          ) : books.length === 0 && !hasActiveFilters ? (
            <div className="empty-state">
              <div className="empty-state-card">
                <strong>Sua biblioteca ainda esta vazia</strong>
                <p>Adicione o primeiro livro para comecar a montar sua colecao.</p>
                <button type="button" className="action-button primary-button empty-state-action" onClick={onOpenCreateModal}>
                  + Novo livro
                </button>
              </div>
            </div>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-card">
                <strong>Nenhum resultado encontrado</strong>
                <p>Tente outro termo ou volte para a colecao completa.</p>
                <button type="button" className="secondary-button empty-state-action" onClick={onClearFilters}>
                  Limpar filtros
                </button>
              </div>
            </div>
          ) : (
            <div className="book-list">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isEditing={editingBookId === book.id}
                  isAnnotationOpen={annotationBookId === book.id}
                  editErrors={editErrors}
                  isSaving={savingBookId === book.id}
                  isSavingAnnotation={savingAnnotationBookId === book.id}
                  isDeletingAnnotation={deletingAnnotationBookId === book.id}
                  annotationError={annotationBookId === book.id ? annotationError : ''}
                  readingStatusOptions={readingStatusOptions}
                  activeMenuBookId={activeMenuBookId}
                  actionMenuRef={actionMenuRef}
                  onToggleMenu={onToggleMenu}
                  onStartEditing={onStartEditing}
                  onOpenAnnotation={onOpenAnnotation}
                  onRequestDelete={onRequestDelete}
                  onSave={onSave}
                  onCancelEditing={onCancelEditing}
                  onSaveAnnotation={onSaveAnnotation}
                  onDeleteAnnotation={onDeleteAnnotation}
                  onCloseAnnotation={onCloseAnnotation}
                />
              ))}
            </div>
          )}
        </div>

        {totalBooks > 0 ? (
          <div className="pagination-bar">
            <div className="pagination-summary">
              <strong>{`Página ${currentPage} de ${totalPages}`}</strong>
              <span>{`Exibindo ${visibleRangeStart} a ${visibleRangeEnd} de ${totalBooks} livros`}</span>
            </div>

            <div className="pagination-actions">
              <button type="button" className="secondary-button pagination-button" disabled={!hasPreviousPage || isLoading} onClick={onPreviousPage}>
                Anterior
              </button>
              <button type="button" className="secondary-button pagination-button" disabled={!hasNextPage || isLoading} onClick={onNextPage}>
                Próxima
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
