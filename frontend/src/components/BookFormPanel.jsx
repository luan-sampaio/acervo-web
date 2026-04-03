export default function BookFormPanel({
  form,
  formErrors,
  formTouched,
  isFormValid,
  isSubmitting,
  error,
  onChange,
  onBlur,
  onSubmit,
}) {
  return (
    <div className="panel form-panel">
      <div className="panel-header">
        <h2>Novo livro</h2>
        <p>Preencha os dados básicos para registrar um livro.</p>
      </div>

      <form className="book-form" onSubmit={onSubmit}>
        <label>
          <span>Título</span>
          <input
            name="titulo"
            value={form.titulo}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="Ex.: Dom Casmurro"
            aria-invalid={formTouched.titulo && Boolean(formErrors.titulo)}
            className={formTouched.titulo && formErrors.titulo ? 'input-error' : ''}
            minLength={2}
            required
          />
          {formTouched.titulo && formErrors.titulo ? <span className="field-error">{formErrors.titulo}</span> : null}
        </label>

        <label>
          <span>Autor</span>
          <input
            name="autor"
            value={form.autor}
            onChange={onChange}
            onBlur={onBlur}
            placeholder="Ex.: Machado de Assis"
            aria-invalid={formTouched.autor && Boolean(formErrors.autor)}
            className={formTouched.autor && formErrors.autor ? 'input-error' : ''}
            minLength={2}
            required
          />
          {formTouched.autor && formErrors.autor ? <span className="field-error">{formErrors.autor}</span> : null}
        </label>

        <button type="submit" disabled={isSubmitting || !isFormValid}>
          {isSubmitting ? 'Salvando...' : 'Cadastrar livro'}
        </button>
      </form>

      {error ? <div className="feedback error">{error}</div> : null}
    </div>
  )
}
