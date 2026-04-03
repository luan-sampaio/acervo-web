const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

class ApiError extends Error {
  constructor(message, options = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = options.status
    this.errors = options.errors ?? []
  }
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null
  }

  const data = await response.json()

  if (!response.ok) {
    const message = data.message ?? 'Ocorreu um erro ao processar a requisição.'
    throw new ApiError(message, {
      status: response.status,
      errors: data.errors,
    })
  }

  return data
}

export async function fetchBooks(params = {}) {
  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  const url = queryString ? `${API_BASE_URL}/books?${queryString}` : `${API_BASE_URL}/books`

  const response = await fetch(url)
  return parseResponse(response)
}

export async function updateBook(bookId, payload) {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}

export async function deleteBook(bookId) {
  const response = await fetch(`${API_BASE_URL}/books/${bookId}`, {
    method: 'DELETE',
  })

  return parseResponse(response)
}

export async function createBook(payload) {
  const response = await fetch(`${API_BASE_URL}/books`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseResponse(response)
}
