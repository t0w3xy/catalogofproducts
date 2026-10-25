import { Link, Navigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import { useAuth } from '../context/AuthContext'

function Login() {
  const { user, login } = useAuth()

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div>
      <AuthForm title="Вход" submitText="Войти" onSubmit={login} />
      <p>
        Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
      </p>
    </div>
  )
}

export default Login
