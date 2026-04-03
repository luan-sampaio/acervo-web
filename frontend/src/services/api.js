import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const detail = error.response?.data?.detail

    return Promise.reject({
      message:
        typeof detail === 'string'
          ? detail
          : error.response?.data?.message ?? 'Ocorreu um erro ao processar a requisição.',
      status: error.response?.status,
      errors: Array.isArray(detail) ? detail : [],
      originalError: error,
    })
  },
)

export const fetchBooks = (params = {}) => api.get('/books', { params })
export const createBook = (payload) => api.post('/books', payload)
export const updateBook = (bookId, payload) => api.put(`/books/${bookId}`, payload)
export const deleteBook = (bookId) => api.delete(`/books/${bookId}`)

export default api
