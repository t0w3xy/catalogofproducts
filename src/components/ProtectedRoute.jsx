import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function ProtectedRoute({ children }) {
  const { user, checking } = useAuth()

  if (checking) return <p>Загрузка...</p>
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default ProtectedRoute
