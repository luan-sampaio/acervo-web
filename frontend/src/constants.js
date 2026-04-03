export const initialForm = {
  titulo: '',
  autor: '',
}

export const initialEditForm = {
  titulo: '',
  autor: '',
}

export const defaultQuery = {
  limit: 6,
  offset: 0,
  sortBy: 'created_at',
  sortOrder: 'desc',
  search: '',
  author: '',
  createdFrom: '',
  createdTo: '',
}

export const pageSizeOptions = [6, 12, 24]

export const sortOptions = [
  { value: 'created_at', label: 'Data de cadastro' },
  { value: 'titulo', label: 'Título' },
  { value: 'autor', label: 'Autor' },
]

export const sortOrderOptions = [
  { value: 'desc', label: 'Decrescente' },
  { value: 'asc', label: 'Crescente' },
]
