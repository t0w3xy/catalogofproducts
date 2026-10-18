import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

function Dashboard() {
  const { user } = useAuth()
  const { count, total } = useCart()

  return (
    <div>
      <h1>Личный кабинет</h1>
      <div className="card">
        <p>Имя: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>
          В корзине: {count} шт. на {total.toLocaleString('ru-RU')} ₽
        </p>
      </div>
    </div>
  )
}

export default Dashboard
