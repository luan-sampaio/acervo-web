import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createBookAnnotation,
  deleteBookAnnotation,
  updateBookAnnotation,
} from '../services/api'

function updateBookAnnotationInCache(queryClient, bookId, annotation) {
  queryClient.setQueriesData({ queryKey: ['books'] }, (currentData) => {
    if (!currentData?.items) {
      return currentData
    }

    return {
      ...currentData,
      items: currentData.items.map((book) => (
        book.id === bookId
          ? { ...book, annotation }
          : book
      )),
    }
  })
}

function findBookInBooksCache(queryClient, bookId) {
  const booksQueries = queryClient.getQueriesData({ queryKey: ['books'] })

  for (const [, data] of booksQueries) {
    const book = data?.items?.find((item) => item.id === bookId)
    if (book) {
      return book
    }
  }

  return null
}

function createOptimisticAnnotation(bookId, payload, currentAnnotation) {
  const now = new Date().toISOString()

  return {
    id: currentAnnotation?.id ?? `optimistic-${bookId}`,
    user_id: currentAnnotation?.user_id ?? 0,
    book_id: bookId,
    rating: payload.rating,
    review: payload.review,
    started_at: payload.started_at,
    finished_at: payload.finished_at,
    created_at: currentAnnotation?.created_at ?? now,
    updated_at: now,
  }
}

export function useAnnotationMutations({
  setAnnotationBookId,
  setAnnotationError,
  showSnackbar,
}) {
  const queryClient = useQueryClient()

  const saveAnnotationMutation = useMutation({
    mutationFn: ({ bookId, payload, hasAnnotation }) => (
      hasAnnotation
        ? updateBookAnnotation(bookId, payload)
        : createBookAnnotation(bookId, payload)
    ),
    onMutate: async ({ bookId, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['books'] })
      const previousBooksQueries = queryClient.getQueriesData({ queryKey: ['books'] })
      const currentBook = findBookInBooksCache(queryClient, bookId)

      updateBookAnnotationInCache(
        queryClient,
        bookId,
        createOptimisticAnnotation(bookId, payload, currentBook?.annotation),
      )
      return { previousBooksQueries }
    },
    onError: (_error, _variables, context) => {
      context?.previousBooksQueries?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSuccess: async (savedAnnotation, { bookId }) => {
      setAnnotationError('')
      setAnnotationBookId(null)
      updateBookAnnotationInCache(queryClient, bookId, savedAnnotation)
      showSnackbar({
        message: 'Anotação salva',
        detail: 'Sua avaliação foi vinculada ao livro.',
      })
      await queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })

  const deleteAnnotationMutation = useMutation({
    mutationFn: deleteBookAnnotation,
    onMutate: async (bookId) => {
      await queryClient.cancelQueries({ queryKey: ['books'] })
      const previousBooksQueries = queryClient.getQueriesData({ queryKey: ['books'] })

      updateBookAnnotationInCache(queryClient, bookId, null)
      return { previousBooksQueries }
    },
    onError: (_error, _bookId, context) => {
      context?.previousBooksQueries?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSuccess: async (_response, bookId) => {
      setAnnotationError('')
      setAnnotationBookId(null)
      updateBookAnnotationInCache(queryClient, bookId, null)
      showSnackbar({
        message: 'Anotação removida',
        detail: 'Nota, resenha e datas foram apagadas.',
      })
      await queryClient.invalidateQueries({ queryKey: ['books'] })
    },
  })

  return {
    deleteAnnotationMutation,
    saveAnnotationMutation,
  }
}
