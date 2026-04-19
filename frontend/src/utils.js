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

export function formatDateOnly(value) {
  if (!value) {
    return ''
  }

  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) {
    return ''
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(new Date(year, month - 1, day))
}

export function formatReadingPeriod(annotation) {
  if (!annotation?.started_at && !annotation?.finished_at) {
    return ''
  }

  if (annotation.started_at && annotation.finished_at) {
    return `${formatDateOnly(annotation.started_at)} a ${formatDateOnly(annotation.finished_at)}`
  }

  if (annotation.started_at) {
    return `Iniciou em ${formatDateOnly(annotation.started_at)}`
  }

  return `Terminou em ${formatDateOnly(annotation.finished_at)}`
}

export function formatRatingLabel(rating) {
  if (!rating) {
    return ''
  }

  return `Nota ${rating}/5`
}
