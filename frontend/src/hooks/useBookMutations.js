import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteBook, updateBook } from '../services/api'

export function getFieldErrorsFromApi(error) {
  const fieldErrors = { titulo: '', autor: '' }

  if (!Array.isArray(error?.errors)) {
    return fieldErrors
  }

  error.errors.forEach((item) => {
    if (item.field === 'body.titulo') {
      fieldErrors.titulo = item.message
    }

    if (item.field === 'body.autor') {
      fieldErrors.autor = item.message
    }
  })

  return fieldErrors
}

export function useBookMutations({
  annotationBookId,
  editingBookId,
  setAnnotationBookId,
  setAnnotationError,
  setBookPendingDelete,
  setEditingBookId,
  setQuery,
  setSuccessMessage,
}) {
  const queryClient = useQueryClient()

  const updateBookMutation = useMutation({
    mutationFn: ({ bookId, payload }) => updateBook(bookId, payload),
    onSuccess: async () => {
      setEditingBookId(null)
      setSuccessMessage('✓ Livro atualizado com sucesso')
      await queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })

  const deleteBookMutation = useMutation({
    mutationFn: ({ bookId }) => deleteBook(bookId),
    onSuccess: async (_, { bookId, query, totalBooks }) => {
      const nextTotal = Math.max(totalBooks - 1, 0)
      const nextOffset = nextTotal === 0
        ? 0
        : Math.min(query.offset, Math.floor((nextTotal - 1) / query.limit) * query.limit)

      if (editingBookId === bookId) {
        setEditingBookId(null)
      }

      if (annotationBookId === bookId) {
        setAnnotationBookId(null)
        setAnnotationError('')
      }

      setBookPendingDelete(null)
      setQuery((current) => ({
        ...current,
        offset: nextOffset,
      }))
      setSuccessMessage('✓ Livro removido com sucesso')
      await queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })

  return {
    deleteBookMutation,
    updateBookMutation,
  }
}
