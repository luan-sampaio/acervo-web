import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { initialForm, readingStatusOptions } from '../constants'
import { createBook } from '../services/api'

export default function NewBook() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(initialForm)
  const [errorMessage, setErrorMessage] = useState('')

  const createBookMutation = useMutation({
    mutationFn: createBook,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['books'] })
      navigate('/')
    },
    onError: (error) => {
      const detail = error.response?.data?.detail
      setErrorMessage(typeof detail === 'string' ? detail : 'Nao foi possivel cadastrar o livro.')
    },
  })

  function handleChange(event) {
    const { name, type, value, checked } = event.target
    setErrorMessage('')
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    createBookMutation.mutate({
      titulo: form.titulo.trim(),
      autor: form.autor.trim(),
      status_leitura: form.status_leitura,
      favorito: form.favorito,
    })
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Adicionar Livro</h1>
            <p className="mt-2 text-slate-600">
              Cadastre um novo livro usando Axios e TanStack Query.
            </p>
          </div>

          <Link
            to="/"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Voltar
          </Link>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="titulo">
              Titulo
            </label>
            <input
              id="titulo"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
              placeholder="Ex.: Dom Casmurro"
              minLength={2}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="autor">
              Autor
            </label>
            <input
              id="autor"
              name="autor"
              value={form.autor}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
              placeholder="Ex.: Machado de Assis"
              minLength={2}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="status_leitura">
              Status de leitura
            </label>
            <select
              id="status_leitura"
              name="status_leitura"
              value={form.status_leitura}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-slate-500"
            >
              {readingStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-3 text-sm text-slate-700">
            <input
              type="checkbox"
              name="favorito"
              checked={form.favorito}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300"
            />
            Marcar como favorito
          </label>

          {errorMessage ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={createBookMutation.isPending}
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {createBookMutation.isPending ? 'Salvando...' : 'Cadastrar livro'}
          </button>
        </form>
      </div>
    </main>
  )
}
