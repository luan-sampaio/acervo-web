import { formatDate } from '../utils'

function BookCard({
  book,
  isEditing,
  editForm,
  editErrors,
  editTouched,
  savingBookId,
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
            </div>
          </div>
        ) : (
          <div className="book-main">
            <h3>{book.titulo}</h3>
            <p className="book-author">{book.autor}</p>
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
          <span className="book-id">#{book.id}</span>
          <span className="book-date">{formatDate(book.created_at)}</span>
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
  authorFilter,
  isLoading,
  editingBookId,
  activeMenuBookId,
  editForm,
  editErrors,
  editTouched,
  savingBookId,
  currentPage,
  totalPages,
  visibleRangeStart,
  visibleRangeEnd,
  hasPreviousPage,
  hasNextPage,
  actionMenuRef,
  onSearchChange,
  onAuthorFilterChange,
  onClearFilters,
  pageSizeOptions,
  sortOptions,
  sortOrderOptions,
  onSortByChange,
  onSortOrderChange,
  onPageSizeChange,
  onPreviousPage,
  onNextPage,
  onEditChange,
  onEditBlur,
  onToggleMenu,
  onStartEditing,
  onRequestDelete,
  onSave,
  onCancelEditing,
}) {
  const hasActiveFilters = Boolean(searchTerm || authorFilter)
  const activeFilterLabels = [
    searchTerm ? `Busca: ${searchTerm}` : null,
    authorFilter ? `Autor: ${authorFilter}` : null,
  ].filter(Boolean)

  return (
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
        <div className="toolbar-hero">
          <div className="toolbar-hero-copy">
            <span className="toolbar-kicker">Explorar acervo</span>
            <h3>Encontre rapidamente o que importa na sua coleção</h3>
            <p>
              Use busca e autor para refinar os resultados sem perder o contexto da listagem.
            </p>
          </div>

          <div className="toolbar-hero-meta">
            <div className="toolbar-stat">
              <strong>{totalBooks}</strong>
              <span>resultados</span>
            </div>
            {hasActiveFilters ? <span className="toolbar-badge">Filtros ativos</span> : null}
          </div>
        </div>

        <div className="toolbar-surface">
          <div className="toolbar-grid toolbar-grid-search">
            <label className="search-field search-field-wide">
              <span>Buscar por título ou autor</span>
              <input
                value={searchTerm}
                onChange={onSearchChange}
                placeholder="Ex.: Machado de Assis"
              />
            </label>

            <label className="toolbar-input-field">
              <span>Autor</span>
              <input
                value={authorFilter}
                onChange={onAuthorFilterChange}
                placeholder="Ex.: Ana Almeida"
              />
            </label>
          </div>

          {hasActiveFilters ? (
            <div className="toolbar-active-filters">
              <div className="toolbar-chip-row">
                {activeFilterLabels.map((label) => (
                  <span key={label} className="toolbar-chip">
                    {label}
                  </span>
                ))}
              </div>
              <button type="button" className="secondary-button toolbar-clear-button" onClick={onClearFilters}>
                Limpar filtros
              </button>
            </div>
          ) : null}

          <div className="toolbar-divider" />

          <div className="toolbar-grid toolbar-grid-controls">
            <div className="list-control-group">
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

              <label className="toolbar-select-field">
                <span>Direção</span>
                <select value={query.sortOrder} onChange={onSortOrderChange}>
                  {sortOrderOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="toolbar-select-field toolbar-select-field-compact">
                <span>Por página</span>
                <select value={query.limit} onChange={onPageSizeChange}>
                  {pageSizeOptions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="empty-state">Carregando livros...</div>
      ) : books.length === 0 ? (
        <div className="empty-state">
          {totalBooks === 0 ? 'Nenhum livro cadastrado até o momento.' : 'Nenhum livro encontrado para a busca informada.'}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="empty-state">Nenhum livro encontrado para a busca informada.</div>
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

      {totalBooks > 0 ? (
        <div className="pagination-bar">
          <div className="pagination-summary">
            <strong>{`Página ${currentPage} de ${totalPages}`}</strong>
            <span>{`Mostrando ${visibleRangeStart}-${visibleRangeEnd} de ${totalBooks} livros`}</span>
          </div>

          <div className="pagination-actions">
            <button type="button" className="secondary-button" disabled={!hasPreviousPage || isLoading} onClick={onPreviousPage}>
              Anterior
            </button>
            <button type="button" className="secondary-button" disabled={!hasNextPage || isLoading} onClick={onNextPage}>
              Próxima
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
