import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})

class ApiError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.errors = options.errors ?? []
  }
}

function normalizeApiError(error) {
  const detail = error.response?.data?.detail
  const message =
    typeof detail === 'string'
      ? detail
      : error.response?.data?.message ?? 'Ocorreu um erro ao processar a requisição.'

  throw new ApiError(message, {
    status: error.response?.status,
    errors: Array.isArray(detail) ? detail : [],
  })
}

async function request(config) {
  try {
    const response = await api.request(config)
    return response.data ?? null
  } catch (error) {
    normalizeApiError(error)
  }
}

export async function fetchBooks(params = {}) {
  return request({
    method: 'GET',
    url: '/books',
    params,
  })
}

export async function updateBook(bookId, payload) {
  return request({
    method: 'PUT',
    url: `/books/${bookId}`,
    data: payload,
  })
}

export async function deleteBook(bookId) {
  return request({
    method: 'DELETE',
    url: `/books/${bookId}`,
  })
}

export async function createBook(payload) {
  return request({
    method: 'POST',
    url: '/books',
    data: payload,
  })
}
