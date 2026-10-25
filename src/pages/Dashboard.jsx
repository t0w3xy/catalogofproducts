import { useEffect, useState } from 'react'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'

const STATUS = {
  pending: 'Ожидает',
  confirmed: 'Подтверждена',
  cancelled: 'Отменена',
  done: 'Выполнена',
}

function Dashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api('/appointments')
      .then((data) => {
        if (!cancelled) setAppointments(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <h1>Профиль</h1>
      <div className="card">
        <p>Email: {user.email}</p>
        <p>Роль: {user.role}</p>
      </div>

      <h2>Мои записи</h2>
      {loading && <p>Загрузка записей...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && appointments.length === 0 && <p>Записей пока нет.</p>}

      {appointments.map((a) => (
        <div className="row" key={a.id}>
          <div>
            <strong>{a.service_name}</strong> × {a.quantity}
            <div className="muted">
              {new Date(a.scheduled_at).toLocaleString('ru-RU')} · {STATUS[a.status] || a.status}
            </div>
          </div>
          <span>{a.amount.toLocaleString('ru-RU')} ₽</span>
        </div>
      ))}
    </div>
  )
}

export default Dashboard
