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
export const updateBookTags = (bookId, tagIds) => api.put(`/books/${bookId}/tags`, { tag_ids: tagIds })

export const searchExternalBooks = (q) => api.get('/search', { params: { q } })

export const fetchCategories = () => api.get('/categories')
export const createCategory = (payload) => api.post('/categories', payload)
export const deleteCategory = (categoryId) => api.delete(`/categories/${categoryId}`)

export const fetchTags = () => api.get('/tags')
export const createTag = (payload) => api.post('/tags', payload)
export const deleteTag = (tagId) => api.delete(`/tags/${tagId}`)

export default api
