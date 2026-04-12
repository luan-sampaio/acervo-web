import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login as apiLogin, register as apiRegister } from '../services/api'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const fn = mode === 'login' ? apiLogin : apiRegister
      const data = await fn({ email, password })
      login(data.access_token, data.user)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message ?? 'Ocorreu um erro. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <span className="app-brand-mark" aria-hidden="true">
            <span className="app-brand-mark-book" />
            <span className="app-brand-mark-page" />
          </span>
          <strong>Acervo</strong>
        </div>

        <h1 className="auth-title">
          {mode === 'login' ? 'Entrar na sua conta' : 'Criar uma conta'}
        </h1>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-field">
            <label className="form-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              className="form-input"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="password">Senha</label>
            <input
              id="password"
              className="form-input"
              type="password"
              name="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error ? <p className="auth-error">{error}</p> : null}

          <button
            type="submit"
            className="action-button primary-button"
            disabled={isLoading}
          >
            {isLoading
              ? 'Aguarde...'
              : mode === 'login'
                ? 'Entrar'
                : 'Criar conta'}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
          <button
            type="button"
            className="auth-switch-link"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}
          >
            {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  )
}
