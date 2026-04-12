import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCategory, createTag, deleteCategory, deleteTag } from '../services/api'

function ColorDot({ cor }) {
  if (!cor) return null
  return <span className="color-dot" style={{ background: cor }} />
}

function CategorySection({ categories }) {
  const queryClient = useQueryClient()
  const [nome, setNome] = useState('')
  const [cor, setCor] = useState('#6366f1')
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      setNome('')
      setError('')
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err) => setError(err.message ?? 'Erro ao criar categoria'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })

  function handleSubmit(event) {
    event.preventDefault()
    if (!nome.trim()) return
    createMutation.mutate({ nome: nome.trim(), cor })
  }

  return (
    <div className="ctm-section">
      <h3 className="ctm-section-title">Categorias</h3>

      <form className="ctm-create-form" onSubmit={handleSubmit}>
        <input
          className="ctm-input"
          placeholder="Nome da categoria"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={100}
          required
        />
        <label className="ctm-color-label" title="Cor">
          <input type="color" value={cor} onChange={(e) => setCor(e.target.value)} className="ctm-color-input" />
        </label>
        <button type="submit" className="action-button primary-button ctm-btn" disabled={createMutation.isPending || !nome.trim()}>
          Criar
        </button>
      </form>

      {error ? <p className="ctm-error">{error}</p> : null}

      <ul className="ctm-list">
        {categories.length === 0 ? (
          <li className="ctm-empty">Nenhuma categoria criada.</li>
        ) : categories.map((cat) => (
          <li key={cat.id} className="ctm-item">
            <ColorDot cor={cat.cor} />
            <span className="ctm-item-name">{cat.nome}</span>
            <button
              type="button"
              className="ctm-delete-btn"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(cat.id)}
              title="Excluir categoria"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function TagSection({ tags }) {
  const queryClient = useQueryClient()
  const [nome, setNome] = useState('')
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      setNome('')
      setError('')
      queryClient.invalidateQueries({ queryKey: ['tags'] })
    },
    onError: (err) => setError(err.message ?? 'Erro ao criar tag'),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tags'] }),
  })

  function handleSubmit(event) {
    event.preventDefault()
    if (!nome.trim()) return
    createMutation.mutate({ nome: nome.trim() })
  }

  return (
    <div className="ctm-section">
      <h3 className="ctm-section-title">Tags</h3>

      <form className="ctm-create-form" onSubmit={handleSubmit}>
        <input
          className="ctm-input"
          placeholder="Nome da tag"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={50}
          required
        />
        <button type="submit" className="action-button primary-button ctm-btn" disabled={createMutation.isPending || !nome.trim()}>
          Criar
        </button>
      </form>

      {error ? <p className="ctm-error">{error}</p> : null}

      <ul className="ctm-list">
        {tags.length === 0 ? (
          <li className="ctm-empty">Nenhuma tag criada.</li>
        ) : tags.map((tag) => (
          <li key={tag.id} className="ctm-item">
            <span className="ctm-item-name">{tag.nome}</span>
            <button
              type="button"
              className="ctm-delete-btn"
              disabled={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(tag.id)}
              title="Excluir tag"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CategoryTagModal({ categories, tags, onClose }) {
  return (
    <div className="modal-overlay" role="presentation" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-card ctm-modal">
        <div className="ctm-modal-header">
          <h2>Gerenciar categorias e tags</h2>
          <button type="button" className="ctm-close-btn" onClick={onClose} aria-label="Fechar">✕</button>
        </div>
        <div className="ctm-body">
          <CategorySection categories={categories} />
          <TagSection tags={tags} />
        </div>
      </div>
    </div>
  )
}
