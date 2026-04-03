import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000',
})

export async function getBooks() {
  const response = await api.get('/books')
  return response.data.items
}

export async function createBook(payload) {
  const response = await api.post('/books', payload)
  return response.data
}

export async function deleteBook(bookId) {
  await api.delete(`/books/${bookId}`)
}

export async function updateBook(bookId, payload) {
  const response = await api.put(`/books/${bookId}`, payload)
  return response.data
}

export default api
