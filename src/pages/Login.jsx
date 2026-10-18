import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { user, login, register } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  // уже вошли — сразу в кабинет
  if (user) return <Navigate to="/dashboard" replace />

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (mode === 'register' && name.trim().length < 2) {
      return setError('Введите имя (минимум 2 символа)')
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setError('Введите корректный email')
    }
    if (password.length < 6) {
      return setError('Пароль должен быть не короче 6 символов')
    }

    const result =
      mode === 'register'
        ? register(name.trim(), email.trim(), password)
        : login(email.trim(), password)

    if (!result.ok) return setError(result.error)

    // редирект после успешного входа
    navigate('/dashboard', { replace: true })
  }

  return (
    <div>
      <h1>{mode === 'login' ? 'Вход' : 'Регистрация'}</h1>

      <form onSubmit={handleSubmit}>
        {mode === 'register' && (
          <input
            placeholder="Имя"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">
          {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
        </button>
      </form>

      <p>
        {mode === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
        <button
          type="button"
          className="link-btn"
          onClick={() => {
            setMode(mode === 'login' ? 'register' : 'login')
            setError('')
          }}
        >
          {mode === 'login' ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </p>
    </div>
  )
}

export default Login
