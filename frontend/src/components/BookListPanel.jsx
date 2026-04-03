import { formatShortDate } from '../utils'

function getReadingStatusLabel(value, readingStatusOptions) {
  return readingStatusOptions.find((option) => option.value === value)?.label ?? value
}

function BookCard({
  book,
  isEditing,
  editForm,
  editErrors,
  editTouched,
  savingBookId,
  readingStatusOptions,
  activeMenuBookId,
  actionMenuRef,
  onEditChange,
  onEditBlur,
  onToggleMenu,
  onStartEditing,
  onRequestDelete,
  onSave,
  onCancelEditing,
}) {
  return (
    <article key={book.id} className="book-card">
      <div className="book-card-top">
        {isEditing ? (
          <div className="book-main book-main-editing">
            <div className="inline-form">
              <label>
                <span>Título</span>
                <input
                  name="titulo"
                  value={editForm.titulo}
                  onChange={onEditChange}
                  onBlur={onEditBlur}
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
                  onChange={onEditChange}
                  onBlur={onEditBlur}
                  aria-invalid={editTouched.autor && Boolean(editErrors.autor)}
                  className={editTouched.autor && editErrors.autor ? 'input-error' : ''}
                  minLength={2}
                  required
                />
                {editTouched.autor && editErrors.autor ? <span className="field-error">{editErrors.autor}</span> : null}
              </label>
              <label>
                <span>Status de leitura</span>
                <select name="status_leitura" value={editForm.status_leitura} onChange={onEditChange}>
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
                  checked={editForm.favorito}
                  onChange={onEditChange}
                />
                <span>Favorito</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="book-main">
            <div className="book-card-kicker-row">
              <span className="book-id">Livro #{book.id}</span>
              <span className="book-date book-date-inline">{formatShortDate(book.created_at)}</span>
            </div>
            <h3>{book.titulo}</h3>
            <p className="book-author">{book.autor}</p>
            <div className="book-badges">
              <span className="book-status-badge">
                {getReadingStatusLabel(book.status_leitura, readingStatusOptions)}
              </span>
              {book.favorito ? <span className="book-favorite-badge">Favorito</span> : null}
            </div>
          </div>
        )}

        <div className="book-meta">
          {isEditing ? null : (
            <div className="book-menu" ref={activeMenuBookId === book.id ? actionMenuRef : null}>
              <button
                type="button"
                className="menu-trigger"
                aria-label={`Ações do livro ${book.titulo}`}
                aria-haspopup="menu"
                aria-expanded={activeMenuBookId === book.id}
                onClick={() => onToggleMenu(book.id)}
              >
                <span className="menu-trigger-dot" />
                <span className="menu-trigger-dot" />
                <span className="menu-trigger-dot" />
              </button>

              {activeMenuBookId === book.id ? (
                <div className="card-menu" role="menu">
                  <button type="button" role="menuitem" onClick={() => onStartEditing(book)}>
                    Editar
                  </button>
                  <button type="button" role="menuitem" className="card-menu-danger" onClick={() => onRequestDelete(book)}>
                    Excluir
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
            type="button"
            className="action-button primary-button"
            disabled={savingBookId === book.id}
            onClick={() => onSave(book.id)}
          >
            {savingBookId === book.id ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            className="action-button secondary-button"
            disabled={savingBookId === book.id}
            onClick={onCancelEditing}
          >
            Cancelar
          </button>
        </div>
      ) : null}
    </article>
  )
}

export default function BookListPanel({
  books,
  totalBooks,
  filteredBooks,
  query,
  searchTerm,
  isLoading,
  editingBookId,
  activeMenuBookId,
  editForm,
  editErrors,
  editTouched,
  savingBookId,
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
  onEditChange,
  onEditBlur,
  onToggleMenu,
  onStartEditing,
  onRequestDelete,
  onSave,
  onCancelEditing,
  onOpenCreateModal,
  onStatusFilterChange,
  error,
}) {
  const quickFilters = [
    { value: 'all', label: 'Todos' },
    { value: 'quero_ler', label: 'Quero ler' },
    { value: 'favorito', label: 'Favorito' },
  ]
  const hasActiveFilters = Boolean(searchTerm) || query.statusFilter !== 'all'

  return (
    <div className="panel list-panel">
      <div className="panel-header panel-header-inline">
        <div className="list-header-copy">
          <span className="list-header-kicker">Colecao</span>
          <h2>Livros cadastrados</h2>
          <p>Acompanhe, filtre e organize os livros registrados na sua biblioteca.</p>
        </div>
        <div className="list-header-actions">
          <div className="sync-status sync-status-subtle" aria-label="Sincronizado">
            <span className="sync-icon">✓</span>
            <span>Sincronizado</span>
          </div>
          <button type="button" className="action-button primary-button list-create-button" onClick={onOpenCreateModal}>
            Novo livro
          </button>
        </div>
      </div>

      {error ? <div className="feedback error list-feedback">{error}</div> : null}

      <div className="list-toolbar">
        <div className="toolbar-grid toolbar-grid-compact">
          <label className="search-field search-field-wide">
            <span>Buscar livros</span>
            <input
              value={searchTerm}
              onChange={onSearchChange}
              placeholder="Ex.: Machado de Assis"
            />
          </label>

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
            <button type="button" className="secondary-button toolbar-clear-button toolbar-clear-button-inline" onClick={onClearFilters}>
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
                <span className="empty-state-kicker">Carregando</span>
                <strong>Buscando livros da sua colecao</strong>
                <p>Estamos atualizando os registros para mostrar a lista mais recente.</p>
              </div>
            </div>
          ) : books.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-card">
                <span className="empty-state-kicker">Biblioteca vazia</span>
                <strong>Nenhum livro cadastrado ate o momento</strong>
                <p>Comece adicionando o primeiro livro para montar sua colecao.</p>
              </div>
            </div>
          ) : filteredBooks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-card">
                <span className="empty-state-kicker">Sem resultados</span>
                <strong>Nenhum livro encontrado para essa busca</strong>
                <p>Tente outro termo ou limpe os filtros para ver toda a colecao novamente.</p>
              </div>
            </div>
          ) : (
            <div className="book-list">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  isEditing={editingBookId === book.id}
                  editForm={editForm}
                  editErrors={editErrors}
                  editTouched={editTouched}
                  savingBookId={savingBookId}
                  readingStatusOptions={readingStatusOptions}
                  activeMenuBookId={activeMenuBookId}
                  actionMenuRef={actionMenuRef}
                  onEditChange={onEditChange}
                  onEditBlur={onEditBlur}
                  onToggleMenu={onToggleMenu}
                  onStartEditing={onStartEditing}
                  onRequestDelete={onRequestDelete}
                  onSave={onSave}
                  onCancelEditing={onCancelEditing}
                />
              ))}
            </div>
          )}
        </div>

        {totalBooks > 0 ? (
          <div className="pagination-bar">
            <div className="pagination-summary">
              <strong>{`Página ${currentPage} de ${totalPages}`}</strong>
              <span>{`Mostrando ${visibleRangeStart}-${visibleRangeEnd} de ${totalBooks} livros`}</span>
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
