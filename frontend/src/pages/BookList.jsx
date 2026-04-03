import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { deleteBook, getBooks } from '../services/api'

function getStatusLabel(status) {
  if (status === 'lendo') {
    return 'Lendo'
  }

  if (status === 'lido') {
    return 'Lido'
  }

  return 'Quero ler'
}

export default function BookList() {
  const queryClient = useQueryClient()
  const {
    data: books = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['books'],
    queryFn: getBooks,
  })

  const deleteBookMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
          <p className="text-slate-600">Carregando livros...</p>
        </div>
      </main>
    )
  }

  if (isError) {
    const message =
      error.response?.data?.detail ??
      error.message ??
      'Nao foi possivel carregar os livros.'

    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700 shadow-sm">
          <p className="font-semibold">Erro ao buscar livros</p>
          <p className="mt-2 text-sm">{message}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Lista de Livros</h1>
            <p className="mt-2 text-slate-600">
              Exibindo os livros carregados via TanStack Query e Axios.
            </p>
          </div>

          <Link
            to="/new"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Adicionar Livro
          </Link>
        </div>

        {books.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-600">
            Nenhum livro encontrado.
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {books.map((book) => (
              <li
                key={book.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">{book.titulo}</h2>
                    <p className="mt-1 text-slate-600">{book.autor}</p>
                  </div>

                  {book.favorito ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      Favorito
                    </span>
                  ) : null}
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
                      {getStatusLabel(book.status_leitura)}
                    </span>

                    <button
                      type="button"
                      onClick={() => deleteBookMutation.mutate(book.id)}
                      disabled={deleteBookMutation.isPending}
                      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deleteBookMutation.isPending ? 'Removendo...' : 'Remover'}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
