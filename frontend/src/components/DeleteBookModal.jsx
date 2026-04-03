export default function DeleteBookModal({
  book,
  isDeleting,
  onCancel,
  onConfirm,
}) {
  if (!book) {
    return null
  }

  return (
    <div className="modal-overlay" role="presentation">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
        <h3 id="delete-modal-title">Confirmar exclusão</h3>
        <p>
          Tem certeza que deseja remover <strong>{book.titulo}</strong> de <strong>{book.autor}</strong>?
        </p>
        <div className="modal-actions">
          <button type="button" className="action-button secondary-button" disabled={isDeleting} onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="action-button danger-button" disabled={isDeleting} onClick={onConfirm}>
            {isDeleting ? 'Excluindo...' : 'Confirmar exclusão'}
          </button>
        </div>
      </div>
    </div>
  )
}
