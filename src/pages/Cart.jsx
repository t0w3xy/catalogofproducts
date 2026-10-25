import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function Cart() {
  const { items, total, removeItem, clearCart } = useCart()
  const { user } = useAuth()

  const [scheduledAt, setScheduledAt] = useState('')
  const [dateError, setDateError] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success
  const [error, setError] = useState('')

  async function handleCheckout() {
    setError('')
    setDateError('')

    if (!scheduledAt) return setDateError('Укажите дату и время записи')
    if (new Date(scheduledAt).getTime() <= Date.now()) {
      return setDateError('Выберите дату в будущем')
    }

    setStatus('loading')
    try {
      await api('/orders', {
        method: 'POST',
        body: {
          scheduledAt,
          items: items.map((i) => ({ serviceId: i.id, quantity: i.qty })),
        },
      })
      clearCart()
      setStatus('success')
    } catch (err) {
      setError(err.message)
      if (err.fields?.scheduledAt) setDateError(err.fields.scheduledAt)
      setStatus('idle')
    }
  }

  if (status === 'success') {
    return (
      <div>
        <h1>Запись оформлена</h1>
        <p>
          Спасибо! Запись и оплата сохранены. Посмотреть их можно в{' '}
          <Link to="/dashboard">профиле</Link>.
        </p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div>
        <h1>Корзина</h1>
        <p>Корзина пуста. <Link to="/catalog">Перейти в каталог услуг</Link></p>
      </div>
    )
  }

  return (
    <div>
      <h1>Корзина</h1>

      {items.map((item) => (
        <div className="row" key={item.id}>
          <div>
            <strong>{item.name}</strong>
            <div className="muted">
              {item.price.toLocaleString('ru-RU')} ₽ × {item.qty} · {item.duration_min} мин
            </div>
          </div>
          <span>{(item.price * item.qty).toLocaleString('ru-RU')} ₽</span>
          <button onClick={() => removeItem(item.id)}>Удалить</button>
        </div>
      ))}

      <h2>Итого: {total.toLocaleString('ru-RU')} ₽</h2>

      {user ? (
        <div className="checkout">
          <label>
            Дата и время записи
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className={dateError ? 'invalid' : ''}
            />
          </label>
          {dateError && <span className="field-error">{dateError}</span>}
          {error && <p className="error">{error}</p>}

          <div className="actions">
            <button onClick={handleCheckout} disabled={status === 'loading'}>
              {status === 'loading' ? 'Оформление...' : 'Оформить запись'}
            </button>
            <button onClick={clearCart} disabled={status === 'loading'}>
              Очистить корзину
            </button>
          </div>
        </div>
      ) : (
        <p>
          Чтобы оформить запись, <Link to="/login">войдите</Link> или{' '}
          <Link to="/register">зарегистрируйтесь</Link>.
        </p>
      )}
    </div>
  )
}

export default Cart
