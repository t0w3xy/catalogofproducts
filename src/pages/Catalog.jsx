import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useCart } from '../context/CartContext'

function Catalog() {
  const { addItem } = useCart()
  const navigate = useNavigate()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [attempt, setAttempt] = useState(0) // меняем, чтобы повторить запрос
  const [addedName, setAddedName] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    api('/services')
      .then((data) => {
        if (!cancelled) setServices(data)
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
  }, [attempt])

  function handleAdd(service) {
    addItem(service)
    setAddedName(service.name)
  }

  return (
    <div>
      <h1>Каталог услуг</h1>

      {loading && <p>Загрузка услуг...</p>}

      {error && (
        <div className="notice error-box">
          <span>{error}</span>
          <button onClick={() => setAttempt((n) => n + 1)}>Повторить</button>
        </div>
      )}

      {addedName && (
        <div className="notice">
          <span>«{addedName}» добавлена в корзину</span>
          <button onClick={() => navigate('/cart')}>Перейти в корзину</button>
        </div>
      )}

      {!loading && !error && services.length === 0 && <p>Услуг пока нет.</p>}

      {services.map((s) => (
        <div className="row" key={s.id}>
          <div>
            <strong>{s.name}</strong>
            <div className="muted">{s.description}</div>
            <div className="muted">
              {s.duration_min} мин · {s.price.toLocaleString('ru-RU')} ₽
            </div>
          </div>
          <button onClick={() => handleAdd(s)}>В корзину</button>
        </div>
      ))}
    </div>
  )
}

export default Catalog
