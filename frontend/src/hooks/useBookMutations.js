import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteBook, updateBook } from '../services/api'

export function useBookMutations({
  annotationBookId,
  editingBookId,
  setAnnotationBookId,
  setAnnotationError,
  setBookPendingDelete,
  setEditingBookId,
  showSnackbar,
}) {
  const queryClient = useQueryClient()

  const updateBookMutation = useMutation({
    mutationFn: ({ bookId, payload }) => updateBook(bookId, payload),
    onSuccess: async (_, variables) => {
      if (variables.closeEditor !== false) {
        setEditingBookId(null)
      }

      showSnackbar({
        message: variables.successMessage ?? 'Livro atualizado',
        detail: variables.successDetail ?? 'As alterações foram salvas na sua coleção.',
      })
      await queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })

  const deleteBookMutation = useMutation({
    mutationFn: ({ bookId }) => deleteBook(bookId),
    onSuccess: async (_, { bookId, query, setQuery, totalBooks }) => {
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
      showSnackbar({
        message: 'Livro removido',
        detail: 'O item saiu da sua coleção.',
      })
      await queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })

  return {
    deleteBookMutation,
    updateBookMutation,
  }
}
