import { Link, Navigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'
import { useAuth } from '../context/AuthContext'

function Register() {
  const { user, register } = useAuth()

  if (user) return <Navigate to="/dashboard" replace />

  return (
    <div>
      <AuthForm title="Регистрация" submitText="Зарегистрироваться" onSubmit={register} />
      <p>
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  )
}

export default Register
