const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function parseResponse(response) {
  if (response.status === 204) {
    return null
  }

  const data = await response.json()

  if (!response.ok) {
    const message = data.message ?? 'Ocorreu um erro ao processar a requisição.'
    throw new Error(message)
  }

  return data
}

export async function fetchBooks() {
  const response = await fetch(`${API_BASE_URL}/books`)
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
