import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

function Home() {
  const { count, total } = useCart()
  const { user } = useAuth()

  return (
    <div>
      <section className="hero">
        <h1>Запишитесь на услугу онлайн</h1>
        <p>
          Выбирайте услуги в каталоге, добавляйте их в корзину и оформляйте запись.
          Тему оформления можно сменить кнопкой в меню.
        </p>
        <Link to="/catalog" className="hero-btn">Перейти в каталог</Link>
      </section>

      <section className="tiles">
        <Link to="/catalog" className="tile">
          <span className="tile-icon">💇</span>
          <h3>Каталог услуг</h3>
          <p>Цены, описание и длительность</p>
        </Link>

        <Link to="/cart" className="tile">
          <span className="tile-icon">🛒</span>
          <h3>Корзина</h3>
          <p>
            {count > 0
              ? `${count} шт. на ${total.toLocaleString('ru-RU')} ₽`
              : 'Пока пуста'}
          </p>
        </Link>

        <Link to={user ? '/dashboard' : '/login'} className="tile">
          <span className="tile-icon">👤</span>
          <h3>Профиль</h3>
          <p>{user ? user.email : 'Войти или зарегистрироваться'}</p>
        </Link>
      </section>
    </div>
  )
}

export default Home
