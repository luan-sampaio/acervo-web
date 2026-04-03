import { formatDate } from '../utils'

export default function HomeOverview({
  totalBooks,
  latestAdditionLabel,
  recentBooks,
  onOpenCollection,
}) {
  return (
    <section className="home-grid">
      <div className="home-hero home-hero-main">
        <div className="home-hero-copy-wrap">
          <span className="eyebrow">Visao geral</span>
          <h1>Transforme sua colecao em um espaco vivo de leitura</h1>
          <p>
            Centralize titulos, acompanhe entradas recentes e navegue pelo acervo
            com mais clareza, ritmo e presenca visual.
          </p>

          <div className="home-actions">
            <button type="button" className="home-primary-action" onClick={onOpenCollection}>
              Explorar colecao
            </button>
            <div className="home-inline-stat">
              <strong>{totalBooks}</strong>
              <span>livros no acervo</span>
            </div>
          </div>
        </div>

        <div className="home-hero-highlight">
          <span className="home-highlight-label">Ritmo do acervo</span>
          <strong>{latestAdditionLabel}</strong>
          <p>Ultima movimentacao registrada na sua colecao.</p>
        </div>
      </div>

      <div className="home-side-panel">
        <div className="home-side-card home-side-card-primary">
          <span>Total de livros</span>
          <strong>{totalBooks}</strong>
          <p>Panorama atual da colecao ativa.</p>
        </div>

        <div className="home-side-card home-side-card-secondary">
          <span>Ultima adicao</span>
          <strong>{latestAdditionLabel}</strong>
          <p>Ajuda voce a retomar de onde parou.</p>
        </div>
      </div>

      <div className="panel home-panel home-panel-wide">
        <div className="panel-header home-panel-header">
          <div>
            <h2>Ultimos registros</h2>
            <p>Os livros mais recentes para voce retomar o contexto rapidamente.</p>
          </div>
          <button type="button" className="secondary-button" onClick={onOpenCollection}>
            Ver colecao completa
          </button>
        </div>

        {recentBooks.length === 0 ? (
          <div className="empty-state">Nenhum livro cadastrado ainda.</div>
        ) : (
          <div className="recent-books-grid">
            {recentBooks.map((book) => (
              <article key={book.id} className="recent-book-card">
                <div className="recent-book-top">
                  <span className="book-id">#{book.id}</span>
                  <span className="recent-book-date">{formatDate(book.created_at)}</span>
                </div>
                <h3>{book.titulo}</h3>
                <p>{book.autor}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
