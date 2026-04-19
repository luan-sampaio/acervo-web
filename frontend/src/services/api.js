import axios from 'axios'

const TOKEN_KEY = 'acervo_token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
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

export const register = (payload) => api.post('/auth/register', payload)
export const login = (payload) => api.post('/auth/login', payload)

export const fetchBooks = (params = {}) => api.get('/books', { params })
export const createBook = (payload) => api.post('/books', payload)
export const updateBook = (bookId, payload) => api.put(`/books/${bookId}`, payload)
export const deleteBook = (bookId) => api.delete(`/books/${bookId}`)

export const fetchBookAnnotation = (bookId) => api.get(`/books/${bookId}/annotation`)
export const createBookAnnotation = (bookId, payload) => api.post(`/books/${bookId}/annotation`, payload)
export const updateBookAnnotation = (bookId, payload) => api.put(`/books/${bookId}/annotation`, payload)
export const deleteBookAnnotation = (bookId) => api.delete(`/books/${bookId}/annotation`)

export const searchExternalBooks = (q) => api.get('/search', { params: { q } })

export default api
