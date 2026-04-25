import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const featureCards = [
  {
    title: 'Fila sob controle',
    description: 'Veja o que quer ler, o que esta lendo e o que ja terminou.',
  },
  {
    title: 'Progresso sem atrito',
    description: 'Atualize o momento de cada leitura sem abrir um formulario grande.',
  },
  {
    title: 'Memoria da leitura',
    description: 'Guarde nota, resenha e datas no mesmo lugar.',
  },
]

const featuredBooks = [
  {
    title: 'Tudo e Rio',
    author: 'Carla Madeira',
    coverUrl: 'https://books.google.com/books/content?id=BCH3EAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    coverUrl: 'https://books.google.com/books/content?id=CixXEAAAQBAJ&printsec=frontcover&img=1&zoom=1&source=gbs_api',
  },
  {
    title: 'A hora da estrela',
    author: 'Clarice Lispector',
    coverUrl: 'https://books.google.com/books/content?id=82UHEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    title: 'Sapiens',
    author: 'Yuval Harari',
    coverUrl: 'https://books.google.com/books/content?id=NZZWEAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    title: 'Dias perfeitos',
    author: 'Raphael Montes',
    coverUrl: 'https://books.google.com/books/content?id=BiaoBAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
  {
    title: 'O avesso da pele',
    author: 'Jeferson Tenorio',
    coverUrl: 'https://books.google.com/books/content?id=cC_tDwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api',
  },
]

const highlights = [
  'Adicione livros em segundos.',
  'Seus dados ficam privados e seguros.',
  'Acompanhe metas e favoritos sem planilhas.',
]

export default function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="landing-page">
      <header className="landing-header">
        <Link to="/" className="landing-brand">
          <span className="app-brand-mark" aria-hidden="true">
            <span className="app-brand-mark-book" />
            <span className="app-brand-mark-page" />
          </span>
          <span className="landing-brand-copy">
            <strong>Acervo</strong>
            <span>Sua biblioteca pessoal em um so lugar</span>
          </span>
        </Link>

        <div className="landing-header-actions">
          <Link to="/login" className="secondary-button landing-header-link">
            Entrar
          </Link>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-kicker">Biblioteca pessoal com foco em leitura real</span>
            <h1>Sua biblioteca, sem planilhas.</h1>
            <p>
              Organize o que quer ler, acompanhe o que esta em andamento e guarde o que vale lembrar.
            </p>

            <div className="landing-hero-actions">
              <Link
                to={isAuthenticated ? '/collection' : '/login?mode=register'}
                className="action-button primary-button landing-cta-primary"
              >
                {isAuthenticated ? 'Abrir minha biblioteca' : 'Criar minha biblioteca gratis'}
              </Link>
            </div>

            <ul className="landing-highlight-list">
              {highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>

          <div className="landing-hero-preview">
            <div className="landing-preview-card">
              <div className="landing-preview-header">
                <div>
                  <span className="landing-preview-kicker">Preview</span>
                  <strong>Uma vitrine da sua leitura</strong>
                </div>
                <span className="landing-preview-pill">Capas em destaque</span>
              </div>

              <div className="landing-showcase">
                <div className="landing-showcase-grid">
                  {featuredBooks.map((item) => (
                    <article key={item.title} className="landing-book-card">
                      <img
                        className="landing-book-cover"
                        src={item.coverUrl}
                        alt={`Capa de ${item.title}`}
                        loading="lazy"
                      />
                      <div className="landing-book-meta">
                        <strong>{item.title}</strong>
                        <span>{item.author}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-feature-section">
          <div className="landing-section-heading">
            <span className="landing-kicker">O que voce encontra aqui</span>
            <h2>So o essencial para acompanhar sua leitura.</h2>
          </div>

          <div className="landing-feature-grid">
            {featureCards.map((feature) => (
              <article key={feature.title} className="landing-feature-card">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
