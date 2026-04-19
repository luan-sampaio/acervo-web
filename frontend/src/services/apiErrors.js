export function getFieldErrorsFromApi(error, fieldNames) {
  const fieldErrors = Object.fromEntries(fieldNames.map((fieldName) => [fieldName, '']))

  if (!Array.isArray(error?.errors)) {
    return fieldErrors
  }

  error.errors.forEach((item) => {
    const fieldName = fieldNames.find((name) => item.field === `body.${name}`)
    if (fieldName) {
      fieldErrors[fieldName] = item.message
    }
  })

  return fieldErrors
}

export function getBookFieldErrorsFromApi(error) {
  return getFieldErrorsFromApi(error, ['titulo', 'autor'])
}
