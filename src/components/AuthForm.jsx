import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { validateCredentials } from '../validation'

// Общая форма для входа и регистрации: поля email и пароль
function AuthForm({ title, submitText, onSubmit }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')

    const found = validateCredentials({ email, password })
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setLoading(true)
    try {
      await onSubmit(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setServerError(err.message)
      setErrors(err.fields || {})
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>{title}</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="field">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={errors.email ? 'invalid' : ''}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="field">
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={errors.password ? 'invalid' : ''}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}
        </div>

        {serverError && <p className="error">{serverError}</p>}

        <button type="submit" disabled={loading}>
          {loading ? 'Отправка...' : submitText}
        </button>
      </form>
    </div>
  )
}

export default AuthForm
