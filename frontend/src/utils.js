export function getTextFieldError(label, value) {
  const trimmedValue = value.trim()

  if (trimmedValue.length === 0) {
    return `${label} é obrigatório`
  }

  if (trimmedValue.length < 2) {
    return `${label} deve ter pelo menos 2 caracteres`
  }

  return ''
}

export function formatDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function formatShortDate(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function formatLatestAddition(value) {
  if (!value) {
    return 'Sem registros recentes'
  }

  const date = new Date(value)
  const now = new Date()

  if (date.toDateString() === now.toDateString()) {
    return `Hoje, ${new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(date)}`
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}
